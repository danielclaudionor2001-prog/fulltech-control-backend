import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  Prisma,
  ServiceOrder as ServiceOrderModel,
  ServiceOrderDeadline,
  ServiceOrderStatus,
  ServiceOrderType,
  UserRole,
} from '../generated/prisma';
import { LocationsService } from '../locations/locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { StartServiceOrderDto } from './dto/start-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';

type ServiceOrderActor = {
  clerkUserId: string | null;
  email: string | null;
  id: string | null;
  name: string | null;
  role: UserRole | null;
};

type ServiceOrderResponse = ServiceOrderModel & {
  assignedTo: ServiceOrderActor | null;
  createdBy: ServiceOrderActor | null;
};

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locationsService: LocationsService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async findAll(actor: CurrentUserPayload) {
    const where =
      actor.role === UserRole.ADMIN
        ? {}
        : {
            OR: [
              { assignedToId: actor.id },
              {
                assignedToId: null,
                status: ServiceOrderStatus.OPEN,
              },
            ],
          };

    const orders = await this.prisma.serviceOrder.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { scheduleAt: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return this.decorateServiceOrders(orders);
  }

  async create(dto: CreateServiceOrderDto, actor: CurrentUserPayload) {
    const scheduleAt = this.buildScheduleAt(dto.scheduleDate, dto.scheduleTime);
    const assignedTo =
      actor.role === UserRole.ADMIN
        ? await this.resolveAssignableUser(this.asNullable(dto.assignedToId))
        : this.toActorSnapshot(actor);

    const createdOrder = await this.prisma.serviceOrder.create({
      data: {
        address: this.asNullable(dto.address),
        assignedToEmail: assignedTo?.email ?? null,
        assignedToId: assignedTo?.id ?? null,
        assignedToName: assignedTo?.name ?? null,
        collaborator: this.asNullable(dto.collaborator),
        createdByEmail: actor.email ?? null,
        createdById: actor.id,
        createdByName: actor.name ?? null,
        customer: dto.customer.trim(),
        deadline: dto.deadline ?? null,
        description: dto.description.trim(),
        durationMinutes: dto.durationMinutes,
        identifier: this.asNullable(dto.identifier),
        osType: dto.osType,
        scheduleAt,
        scheduleTimeText: this.asNullable(dto.scheduleTime),
        status: assignedTo ? ServiceOrderStatus.IN_PROGRESS : ServiceOrderStatus.OPEN,
      },
    });

    return this.decorateServiceOrder(createdOrder);
  }

  async update(
    id: string,
    dto: UpdateServiceOrderDto,
    actor: CurrentUserPayload,
  ) {
    const existing = await this.prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Service order not found');
    }

    if (actor.role === UserRole.TECH) {
      const updatedOrder = await this.updateAsTechnician(existing, dto, actor);
      return this.decorateServiceOrder(updatedOrder);
    }

    const updatedOrder = await this.updateAsAdmin(existing, dto);
    return this.decorateServiceOrder(updatedOrder);
  }

  async start(
    id: string,
    dto: StartServiceOrderDto,
    actor: CurrentUserPayload,
  ) {
    const existing = await this.prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Service order not found');
    }

    if (
      existing.status === ServiceOrderStatus.DONE ||
      existing.status === ServiceOrderStatus.CANCELED
    ) {
      throw new ForbiddenException(
        'This service order can no longer be started',
      );
    }

    if (existing.assignedToId && existing.assignedToId !== actor.id) {
      throw new ForbiddenException(
        'This service order belongs to another technician',
      );
    }

    this.locationsService.updateLocation(actor, dto.lat, dto.lng);

    const updatedOrder = await this.prisma.serviceOrder.update({
      where: { id: existing.id },
      data: {
        assignedToEmail: actor.email ?? null,
        assignedToId: actor.id,
        assignedToName: actor.name ?? null,
        status: ServiceOrderStatus.IN_PROGRESS,
      },
    });

    try {
      await this.whatsAppService.sendServiceOrderStarted({
        address: updatedOrder.address,
        customer: updatedOrder.customer,
        identifier: updatedOrder.identifier,
        latitude: dto.lat,
        longitude: dto.lng,
        serviceOrderId: updatedOrder.id,
        technicianName: actor.name ?? actor.email ?? null,
      });
    } catch {
      // The service order should still start even if the notification provider fails.
    }

    return this.decorateServiceOrder(updatedOrder);
  }

  private async decorateServiceOrders(
    orders: ServiceOrderModel[],
  ): Promise<ServiceOrderResponse[]> {
    const relatedUserIds = Array.from(
      new Set(
        orders
          .flatMap((order) => [order.createdById, order.assignedToId])
          .filter((userId): userId is string => Boolean(userId)),
      ),
    );

    const users =
      relatedUserIds.length > 0
        ? await this.prisma.user.findMany({
            where: {
              id: {
                in: relatedUserIds,
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

    const usersById = new Map(
      users.map((user) => [user.id, this.toActorSnapshot(user)]),
    );

    return orders.map((order) => ({
      ...order,
      assignedTo:
        (order.assignedToId ? usersById.get(order.assignedToId) : null) ??
        this.buildFallbackActor(
          order.assignedToId,
          order.assignedToName,
          order.assignedToEmail,
        ),
      createdBy:
        (order.createdById ? usersById.get(order.createdById) : null) ??
        this.buildFallbackActor(
          order.createdById,
          order.createdByName,
          order.createdByEmail,
        ),
    }));
  }

  private async decorateServiceOrder(
    order: ServiceOrderModel,
  ): Promise<ServiceOrderResponse> {
    const [decoratedOrder] = await this.decorateServiceOrders([order]);
    return decoratedOrder;
  }

  private async updateAsAdmin(
    existing: Pick<
      ServiceOrderModel,
      'assignedToId' | 'id' | 'scheduleAt' | 'scheduleTimeText' | 'status'
    >,
    dto: UpdateServiceOrderDto,
  ) {
    const data: Prisma.ServiceOrderUpdateInput = {};

    if (dto.identifier !== undefined) {
      data.identifier = this.asNullable(dto.identifier);
    }
    if (dto.osType !== undefined) {
      data.osType = dto.osType;
    }
    if (dto.deadline !== undefined) {
      data.deadline = dto.deadline;
    }
    if (dto.customer !== undefined) {
      data.customer = dto.customer.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }
    if (dto.durationMinutes !== undefined) {
      data.durationMinutes = dto.durationMinutes;
    }
    if (dto.collaborator !== undefined) {
      data.collaborator = this.asNullable(dto.collaborator);
    }
    if (dto.address !== undefined) {
      data.address = this.asNullable(dto.address);
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.assignedToId !== undefined) {
      const assignedTo = await this.resolveAssignableUser(
        this.asNullable(dto.assignedToId),
      );

      data.assignedToEmail = assignedTo?.email ?? null;
      data.assignedToId = assignedTo?.id ?? null;
      data.assignedToName = assignedTo?.name ?? null;

      if (dto.status === undefined) {
        if (assignedTo && existing.status === ServiceOrderStatus.OPEN) {
          data.status = ServiceOrderStatus.IN_PROGRESS;
        }

        if (!assignedTo && existing.status === ServiceOrderStatus.IN_PROGRESS) {
          data.status = ServiceOrderStatus.OPEN;
        }
      }
    }

    const shouldUpdateSchedule =
      dto.scheduleDate !== undefined || dto.scheduleTime !== undefined;
    if (shouldUpdateSchedule) {
      const scheduleDate =
        dto.scheduleDate ?? this.dateToInputValue(existing.scheduleAt);
      const scheduleTime =
        dto.scheduleTime ?? existing.scheduleTimeText ?? undefined;
      data.scheduleAt = this.buildScheduleAt(scheduleDate, scheduleTime);
      data.scheduleTimeText = this.asNullable(scheduleTime);
    }

    return this.prisma.serviceOrder.update({
      where: { id: existing.id },
      data,
    });
  }

  private async updateAsTechnician(
    existing: Pick<ServiceOrderModel, 'assignedToId' | 'id' | 'status'>,
    dto: UpdateServiceOrderDto,
    actor: CurrentUserPayload,
  ) {
    const unexpectedFields = [
      'identifier',
      'osType',
      'deadline',
      'customer',
      'description',
      'durationMinutes',
      'scheduleDate',
      'scheduleTime',
      'collaborator',
      'address',
      'assignedToId',
    ].filter(
      (field) => dto[field as keyof UpdateServiceOrderDto] !== undefined,
    );

    if (unexpectedFields.length > 0) {
      throw new ForbiddenException(
        'Technicians can only change service order status',
      );
    }

    if (dto.status === undefined) {
      throw new BadRequestException('Status is required');
    }

    if (existing.assignedToId && existing.assignedToId !== actor.id) {
      throw new ForbiddenException(
        'This service order belongs to another technician',
      );
    }

    if (
      existing.status === ServiceOrderStatus.DONE ||
      existing.status === ServiceOrderStatus.CANCELED
    ) {
      throw new ForbiddenException(
        'This service order can no longer be updated',
      );
    }

    if (!existing.assignedToId) {
      throw new ForbiddenException(
        'Use the start endpoint with location to begin the service order',
      );
    }

    if (
      dto.status !== ServiceOrderStatus.IN_PROGRESS &&
      dto.status !== ServiceOrderStatus.DONE
    ) {
      throw new ForbiddenException(
        'Technicians can only keep progress or finish the service order',
      );
    }

    return this.prisma.serviceOrder.update({
      where: { id: existing.id },
      data: {
        status: dto.status,
      },
    });
  }

  private async resolveAssignableUser(userId: string | null) {
    if (!userId) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        clerkUserId: true,
        email: true,
        id: true,
        isActive: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Assigned user not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Assigned user is inactive');
    }

    return this.toActorSnapshot(user);
  }

  private toActorSnapshot(actor: {
    clerkUserId: string;
    email?: string | null;
    id: string;
    name?: string | null;
    role: UserRole;
  }): ServiceOrderActor {
    return {
      clerkUserId: actor.clerkUserId,
      email: actor.email ?? null,
      id: actor.id,
      name: actor.name ?? null,
      role: actor.role,
    };
  }

  private buildFallbackActor(
    id?: string | null,
    name?: string | null,
    email?: string | null,
  ): ServiceOrderActor | null {
    if (!id && !name && !email) {
      return null;
    }

    return {
      clerkUserId: null,
      email: email ?? null,
      id: id ?? null,
      name: name ?? null,
      role: null,
    };
  }

  private buildScheduleAt(scheduleDate: string, scheduleTime?: string) {
    const time = scheduleTime?.trim() || '00:00';
    const scheduleAt = new Date(`${scheduleDate}T${time}:00`);

    if (Number.isNaN(scheduleAt.getTime())) {
      throw new BadRequestException('Invalid schedule date/time');
    }

    return scheduleAt;
  }

  private asNullable(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private dateToInputValue(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
