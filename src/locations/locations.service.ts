import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ServiceOrderStatus, UserRole } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

type ResponsibleSnapshot = {
  clerkUserId: string | null;
  email: string | null;
  id: string;
  name: string | null;
  role: UserRole | null;
};

type ServiceOrderSnapshot = {
  address: string | null;
  customer: string;
  id: string;
  identifier: string | null;
};

type StoredLocation = {
  lat: number;
  lng: number;
  responsible: ResponsibleSnapshot;
  responsibleAddress: string | null;
  serviceOrder: ServiceOrderSnapshot | null;
  timestamp: string;
};

type Coordinates = {
  lat: number;
  lng: number;
};

const MAX_START_DISTANCE_METERS = 1000;

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);
  private readonly locations = new Map<string, StoredLocation>();
  private readonly forwardGeocodeCache = new Map<string, Coordinates>();
  private readonly reverseGeocodeCache = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  async updateLocation(
    user: CurrentUserPayload,
    lat: number,
    lng: number,
    explicitServiceOrder?: ServiceOrderSnapshot | null,
  ) {
    const activeServiceOrder =
      explicitServiceOrder ?? (await this.findActiveServiceOrder(user.id));
    const timestamp = new Date().toISOString();
    const responsibleAddress = await this.resolveResponsibleAddress(lat, lng);

    this.locations.set(user.id, {
      lat,
      lng,
      responsible: {
        clerkUserId: user.clerkUserId,
        email: user.email ?? null,
        id: user.id,
        name: user.name ?? null,
        role: user.role as UserRole,
      },
      responsibleAddress,
      serviceOrder: activeServiceOrder,
      timestamp,
    });

    if (activeServiceOrder?.id) {
      await this.prisma.serviceOrder.updateMany({
        where: { id: activeServiceOrder.id },
        data: {
          locationCapturedAt: new Date(timestamp),
          locationLat: lat,
          locationLng: lng,
        },
      });
    }

    return { success: true };
  }

  async findAll() {
    const mergedLocations = new Map<string, StoredLocation>();

    for (const [userId, location] of this.locations.entries()) {
      mergedLocations.set(userId, location);
    }

    const persistedOrders = await this.prisma.serviceOrder.findMany({
      where: {
        assignedToId: { not: null },
        locationCapturedAt: { not: null },
        locationLat: { not: null },
        locationLng: { not: null },
      },
      orderBy: [{ locationCapturedAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        address: true,
        assignedToEmail: true,
        assignedToId: true,
        assignedToName: true,
        customer: true,
        id: true,
        identifier: true,
        locationCapturedAt: true,
        locationLat: true,
        locationLng: true,
      },
    });
    const persistedAssignedUserIds = Array.from(
      new Set(
        persistedOrders
          .map((order) => order.assignedToId)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    );
    const persistedUsers =
      persistedAssignedUserIds.length > 0
        ? await this.prisma.user.findMany({
            where: {
              id: {
                in: persistedAssignedUserIds,
              },
            },
            select: {
              clerkUserId: true,
              email: true,
              id: true,
              name: true,
              role: true,
            },
          })
        : [];
    const persistedUsersById = new Map(
      persistedUsers.map((user) => [user.id, user]),
    );

    for (const order of persistedOrders) {
      if (
        !order.assignedToId ||
        order.locationLat === null ||
        order.locationLng === null ||
        !order.locationCapturedAt
      ) {
        continue;
      }

      const existing = mergedLocations.get(order.assignedToId);
      const timestamp = order.locationCapturedAt.toISOString();
      const serviceOrder = this.toServiceOrderSnapshot(order);
      const persistedUser = persistedUsersById.get(order.assignedToId);

      if (existing && existing.timestamp >= timestamp) {
        if (!existing.serviceOrder) {
          mergedLocations.set(order.assignedToId, {
            ...existing,
            serviceOrder,
          });
        }

        continue;
      }

      mergedLocations.set(order.assignedToId, {
        lat: order.locationLat,
        lng: order.locationLng,
        responsible: {
          clerkUserId: persistedUser?.clerkUserId ?? null,
          email: persistedUser?.email ?? order.assignedToEmail ?? null,
          id: order.assignedToId,
          name: persistedUser?.name ?? order.assignedToName ?? null,
          role: persistedUser?.role ?? null,
        },
        responsibleAddress: null,
        serviceOrder,
        timestamp,
      });
    }

    const resolvedLocations = await Promise.all(
      Array.from(mergedLocations.values()).map(async (location) => ({
        ...location,
        responsibleAddress:
          location.responsibleAddress ??
          (await this.resolveResponsibleAddress(location.lat, location.lng)),
      })),
    );

    return resolvedLocations
      .filter((location) => location.responsible.role !== UserRole.ADMIN)
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp));
  }

  async ensureWithinCustomerRange(
    customerAddress: string | null,
    currentLat: number,
    currentLng: number,
  ) {
    if (!customerAddress?.trim()) {
      throw new BadRequestException(
        'Esta OS precisa ter o endereco do cliente preenchido para validar a proximidade do atendimento.',
      );
    }

    const customerCoordinates = await this.forwardGeocode(customerAddress);
    const distance = this.calculateDistanceMeters(
      currentLat,
      currentLng,
      customerCoordinates.lat,
      customerCoordinates.lng,
    );

    if (distance > MAX_START_DISTANCE_METERS) {
      throw new ForbiddenException(
        `Voce precisa estar a ate 1 km do cliente para iniciar esta ordem de servico. Distancia atual aproximada: ${this.formatDistance(distance)}.`,
      );
    }

    return {
      customerCoordinates,
      distance,
    };
  }

  private async findActiveServiceOrder(userId: string) {
    const order = await this.prisma.serviceOrder.findFirst({
      where: {
        assignedToId: userId,
        status: ServiceOrderStatus.IN_PROGRESS,
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        address: true,
        customer: true,
        id: true,
        identifier: true,
      },
    });

    return order ? this.toServiceOrderSnapshot(order) : null;
  }

  private toServiceOrderSnapshot(order: {
    address: string | null;
    customer: string;
    id: string;
    identifier: string | null;
  }): ServiceOrderSnapshot {
    return {
      address: order.address ?? null,
      customer: order.customer,
      id: order.id,
      identifier: order.identifier ?? null,
    };
  }

  private async forwardGeocode(address: string) {
    const normalizedAddress = address.trim().toLowerCase();
    const cached = this.forwardGeocodeCache.get(normalizedAddress);

    if (cached) {
      return cached;
    }

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'br');
    url.searchParams.set('q', `${address}, Brasil`);

    let response: Awaited<ReturnType<typeof fetch>>;

    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'fulltech-control/1.0',
        },
      });
    } catch (error) {
      this.logger.warn(
        `Forward geocoding request failed for "${address}": ${String(error)}`,
      );
      throw new BadRequestException(
        'Nao foi possivel localizar o endereco do cliente no mapa para validar a proximidade.',
      );
    }

    if (!response.ok) {
      throw new BadRequestException(
        'Nao foi possivel localizar o endereco do cliente no mapa para validar a proximidade.',
      );
    }

    const payload = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
    }>;

    const firstMatch = payload[0];
    const lat = Number(firstMatch?.lat);
    const lng = Number(firstMatch?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException(
        'Nao foi possivel localizar o endereco do cliente no mapa para validar a proximidade.',
      );
    }

    const coordinates = { lat, lng };
    this.forwardGeocodeCache.set(normalizedAddress, coordinates);
    return coordinates;
  }

  private async resolveResponsibleAddress(lat: number, lng: number) {
    const cacheKey = `${lat.toFixed(5)}:${lng.toFixed(5)}`;
    const cached = this.reverseGeocodeCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'fulltech-control/1.0',
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        address?: Record<string, string | undefined>;
        display_name?: string;
      };
      const address = this.formatResponsibleAddress(payload);

      if (address) {
        this.reverseGeocodeCache.set(cacheKey, address);
      }

      return address;
    } catch (error) {
      this.logger.warn(
        `Reverse geocoding request failed for ${lat},${lng}: ${String(error)}`,
      );
      return null;
    }
  }

  private formatResponsibleAddress(payload: {
    address?: Record<string, string | undefined>;
    display_name?: string;
  }) {
    const address = payload.address;

    if (!address) {
      return payload.display_name ?? null;
    }

    const street =
      address.road ??
      address.residential ??
      address.pedestrian ??
      address.footway ??
      address.path;
    const number = address.house_number;
    const district =
      address.suburb ?? address.neighbourhood ?? address.city_district;
    const city =
      address.city ?? address.town ?? address.village ?? address.municipality;

    const primary = [street, number].filter(Boolean).join(', ');
    const secondary = [district, city].filter(Boolean).join(' - ');
    const formatted = [primary, secondary].filter(Boolean).join(' | ');

    return formatted || payload.display_name || null;
  }

  private calculateDistanceMeters(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ) {
    const earthRadius = 6371000;
    const deltaLat = this.degreesToRadians(endLat - startLat);
    const deltaLng = this.degreesToRadians(endLng - startLng);
    const startLatRadians = this.degreesToRadians(startLat);
    const endLatRadians = this.degreesToRadians(endLat);

    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(startLatRadians) *
        Math.cos(endLatRadians) *
        Math.sin(deltaLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  private degreesToRadians(value: number) {
    return (value * Math.PI) / 180;
  }

  private formatDistance(distanceMeters: number) {
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)} m`;
    }

    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
}
