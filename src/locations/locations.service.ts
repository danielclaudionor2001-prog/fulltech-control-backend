import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  LocationSignalStatus,
  ServiceOrderStatus,
  UserRole,
} from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

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
  locationStatus: LocationSignalStatus;
  locationStatusChangedAt: string;
  responsible: ResponsibleSnapshot;
  responsibleAddress: string | null;
  serviceOrder: ServiceOrderSnapshot | null;
  timestamp: string;
};

type Coordinates = {
  displayName?: string | null;
  lat: number;
  lng: number;
  query?: string;
};

const MAX_START_DISTANCE_METERS = 1000;
const LOCATION_STALE_MS = 3 * 60 * 1000;

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);
  private readonly locations = new Map<string, StoredLocation>();
  private readonly forwardGeocodeCache = new Map<string, Coordinates>();
  private readonly reverseGeocodeCache = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  async updateLocation(
    user: CurrentUserPayload,
    lat: number,
    lng: number,
    explicitServiceOrder?: ServiceOrderSnapshot | null,
  ) {
    const activeServiceOrder =
      explicitServiceOrder ?? (await this.findActiveServiceOrder(user.id));
    const capturedAt = new Date();
    const timestamp = capturedAt.toISOString();
    const responsibleAddress = await this.resolveResponsibleAddress(lat, lng);

    this.locations.set(user.id, {
      lat,
      lng,
      locationStatus: LocationSignalStatus.ACTIVE,
      locationStatusChangedAt: timestamp,
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

    await this.prisma.user.updateMany({
      where: { id: user.id },
      data: {
        lastLocationAddress: responsibleAddress,
        lastLocationAt: capturedAt,
        lastLocationLat: lat,
        lastLocationLng: lng,
        locationStatus: LocationSignalStatus.ACTIVE,
        locationStatusChangedAt: capturedAt,
      },
    });

    if (activeServiceOrder?.id) {
      await this.prisma.serviceOrder.updateMany({
        where: { id: activeServiceOrder.id },
        data: {
          locationCapturedAt: capturedAt,
          locationLat: lat,
          locationLng: lng,
        },
      });
    }

    void this.activityLogs.record({
      message: 'Localizacao recebida pelo backend.',
      metadata: {
        accuracy: null,
        address: responsibleAddress,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        serviceOrder: activeServiceOrder,
      },
      type: 'location.received',
      userId: user.id,
    });

    return { success: true };
  }

  async updateLocationStatus(
    user: CurrentUserPayload,
    status: LocationSignalStatus,
  ) {
    const changedAt = new Date();
    const changedAtIso = changedAt.toISOString();
    const existingLocation = this.locations.get(user.id);

    if (existingLocation) {
      this.locations.set(user.id, {
        ...existingLocation,
        locationStatus: status,
        locationStatusChangedAt: changedAtIso,
      });
    }

    await this.prisma.user.updateMany({
      where: { id: user.id },
      data: {
        locationStatus: status,
        locationStatusChangedAt: changedAt,
      },
    });

    void this.activityLogs.record({
      message: `Status de localizacao atualizado para ${status}.`,
      metadata: {
        status,
      },
      type: 'location.status_updated',
      userId: user.id,
    });

    return {
      changedAt: changedAtIso,
      status,
      success: true,
    };
  }

  async findStatuses(actor?: CurrentUserPayload) {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.SUPERVISOR, UserRole.TECH],
        },
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }, { email: 'asc' }],
      select: {
        clerkUserId: true,
        email: true,
        id: true,
        imageUrl: true,
        lastLocationAddress: true,
        lastLocationAt: true,
        lastLocationLat: true,
        lastLocationLng: true,
        locationStatus: true,
        locationStatusChangedAt: true,
        name: true,
        role: true,
      },
    });
    const visibleUsers =
      actor?.role === UserRole.TECH
        ? users.filter((user) => user.id === actor.id)
        : users;
    const visibleUserIds = visibleUsers.map((user) => user.id);
    const activeOrders =
      visibleUserIds.length > 0
        ? await this.prisma.serviceOrder.findMany({
            where: {
              assignedToId: { in: visibleUserIds },
              status: ServiceOrderStatus.IN_PROGRESS,
            },
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
            select: {
              address: true,
              assignedToId: true,
              customer: true,
              id: true,
              identifier: true,
            },
          })
        : [];
    const activeOrderByUserId = new Map<string, ServiceOrderSnapshot>();

    for (const order of activeOrders) {
      if (!order.assignedToId || activeOrderByUserId.has(order.assignedToId)) {
        continue;
      }

      activeOrderByUserId.set(
        order.assignedToId,
        this.toServiceOrderSnapshot(order),
      );
    }

    const now = Date.now();

    return visibleUsers.map((user) => {
      const liveLocation = this.locations.get(user.id);
      const liveTimestamp = liveLocation
        ? new Date(liveLocation.timestamp).getTime()
        : 0;
      const persistedTimestamp = user.lastLocationAt?.getTime() ?? 0;
      const shouldUseLiveLocation =
        Boolean(liveLocation) && liveTimestamp >= persistedTimestamp;
      const lastLocationAt = shouldUseLiveLocation
        ? liveLocation?.timestamp
        : (user.lastLocationAt?.toISOString() ?? null);
      const locationStatusChangedAt = shouldUseLiveLocation
        ? liveLocation?.locationStatusChangedAt
        : (user.locationStatusChangedAt?.toISOString() ?? null);
      const latestTimestamp = lastLocationAt
        ? new Date(lastLocationAt).getTime()
        : 0;
      const isStale =
        latestTimestamp > 0 && now - latestTimestamp > LOCATION_STALE_MS;
      const savedStatus = shouldUseLiveLocation
        ? liveLocation?.locationStatus
        : user.locationStatus;
      const status =
        savedStatus === LocationSignalStatus.ACTIVE && isStale
          ? 'STALE'
          : savedStatus || LocationSignalStatus.UNKNOWN;
      const staleSince =
        status === 'STALE'
          ? new Date(latestTimestamp + LOCATION_STALE_MS).toISOString()
          : null;

      return {
        disabledAt:
          status === LocationSignalStatus.DISABLED
            ? locationStatusChangedAt
            : null,
        isOnline: status === LocationSignalStatus.ACTIVE,
        lastLocationAddress: shouldUseLiveLocation
          ? (liveLocation?.responsibleAddress ?? null)
          : user.lastLocationAddress,
        lastLocationAt,
        lastLocationLat: shouldUseLiveLocation
          ? (liveLocation?.lat ?? null)
          : user.lastLocationLat,
        lastLocationLng: shouldUseLiveLocation
          ? (liveLocation?.lng ?? null)
          : user.lastLocationLng,
        locationStatusChangedAt,
        serviceOrder:
          (shouldUseLiveLocation ? liveLocation?.serviceOrder : null) ??
          activeOrderByUserId.get(user.id) ??
          null,
        staleSince,
        status,
        user: {
          clerkUserId: user.clerkUserId,
          email: user.email,
          id: user.id,
          imageUrl: user.imageUrl,
          name: user.name,
          role: user.role,
        },
      };
    });
  }

  async findAll(actor?: CurrentUserPayload) {
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
        locationStatus: LocationSignalStatus.ACTIVE,
        locationStatusChangedAt: timestamp,
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
      .filter((location) =>
        actor?.role === UserRole.TECH
          ? location.responsible.id === actor.id
          : true,
      )
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
    const normalizedAddress = this.normalizeGeocodeQuery(address);
    const cached = this.forwardGeocodeCache.get(normalizedAddress);

    if (cached) {
      return cached;
    }

    const queries = this.buildForwardGeocodeQueries(address);

    for (const query of queries) {
      try {
        const coordinates = await this.searchForwardGeocode(query);

        if (coordinates) {
          this.forwardGeocodeCache.set(normalizedAddress, coordinates);
          this.forwardGeocodeCache.set(
            this.normalizeGeocodeQuery(query),
            coordinates,
          );
          this.logger.log(
            `Forward geocoding matched "${address}" using "${query}" -> ${coordinates.displayName ?? 'coordinates only'}`,
          );
          return coordinates;
        }
      } catch (error) {
        this.logger.warn(
          `Forward geocoding request failed for "${query}" from "${address}": ${String(
            error,
          )}`,
        );
      }
    }

    this.logger.warn(
      `Forward geocoding found no result for "${address}". Attempts: ${queries.join(
        ' | ',
      )}`,
    );
    throw new BadRequestException(
      'Nao foi possivel localizar o endereco do cliente no mapa para validar a proximidade.',
    );
  }

  private async searchForwardGeocode(
    query: string,
  ): Promise<Coordinates | null> {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'br');
    url.searchParams.set('q', this.ensureBrazilSuffix(query));

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'fulltech-control/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Array<{
      display_name?: string;
      lat?: string;
      lon?: string;
    }>;
    const firstMatch = payload[0];
    const lat = Number(firstMatch?.lat);
    const lng = Number(firstMatch?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      displayName: firstMatch?.display_name ?? null,
      lat,
      lng,
      query,
    };
  }

  private buildForwardGeocodeQueries(address: string) {
    const original = address.trim();
    const expanded = this.expandStreetAbbreviations(original);
    const withoutPostalCode = expanded.replace(/\b\d{5}-?\d{3}\b/g, ' ');
    const noDash = withoutPostalCode.replace(/\s+-\s+/g, ', ');
    const parts = expanded.split(/\s+-\s+/).map((part) => part.trim());
    const streetPart = parts[0] ?? expanded;
    const cityState = this.extractCityStateFromAddress(expanded);

    return Array.from(
      new Set(
        [
          original,
          expanded,
          noDash,
          cityState ? `${streetPart} ${cityState}` : '',
          cityState
            ? `${this.expandStreetAbbreviations(streetPart)} ${cityState}`
            : '',
          this.removeAddressDistrict(withoutPostalCode),
          this.stripAccents(noDash),
          this.stripAccents(
            cityState
              ? `${this.expandStreetAbbreviations(streetPart)} ${cityState}`
              : '',
          ),
        ]
          .map((query) => this.normalizeGeocodeQuery(query))
          .filter(Boolean),
      ),
    );
  }

  private expandStreetAbbreviations(address: string) {
    return address
      .replace(/\bR\.\s*/gi, 'Rua ')
      .replace(/\bAv\.\s*/gi, 'Avenida ')
      .replace(/\bAl\.\s*/gi, 'Alameda ')
      .replace(/\bPç\.\s*/gi, 'Praca ');
  }

  private extractCityStateFromAddress(address: string) {
    const withoutPostalCode = address.replace(/\b\d{5}-?\d{3}\b/g, ' ');
    const stateMatch = withoutPostalCode.match(/\b([A-Z]{2})\b/i);
    const state = stateMatch?.[1]?.toUpperCase() ?? '';
    const cityMatch = withoutPostalCode.match(/,\s*([^,-]+)\s+-\s*[A-Z]{2}\b/i);
    const city = cityMatch?.[1]?.trim() ?? '';

    return [city, state].filter(Boolean).join(' ');
  }

  private removeAddressDistrict(address: string) {
    const parts = address.split(/\s+-\s+/).map((part) => part.trim());

    if (parts.length <= 2) {
      return address;
    }

    return [parts[0], parts.slice(2).join(' ')].filter(Boolean).join(' ');
  }

  private ensureBrazilSuffix(query: string) {
    return /\bbrasil\b/i.test(query) ? query : `${query}, Brasil`;
  }

  private normalizeGeocodeQuery(value: string) {
    return value
      .replace(/\s+/g, ' ')
      .replace(/\s+,/g, ',')
      .replace(/,\s*,/g, ',')
      .trim();
  }

  private stripAccents(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
