import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  Prisma,
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

const baseOrderInclude = {
  assignedTo: {
    select: {
      clerkUserId: true,
      email: true,
      id: true,
      name: true,
      role: true,
    },
  },
  createdBy: {
    select: {
      clerkUserId: true,
      email: true,
      id: true,
      name: true,
      role: true,
    },
  },
} satisfies Prisma.ServiceOrderInclude;

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

    return this.prisma.serviceOrder.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { scheduleAt: 'asc' },
        { createdAt: 'desc' },
      ],
      include: baseOrderInclude,
    });
  }

  async create(dto: CreateServiceOrderDto, actor: CurrentUserPayload) {
    const scheduleAt = this.buildScheduleAt(dto.scheduleDate, dto.scheduleTime);
    const assignedToId = this.asNullable(dto.assignedToId);

    if (assignedToId) {
      await this.assertAssignableUser(assignedToId);
    }

    return this.prisma.serviceOrder.create({
      data: {
        identifier: this.asNullable(dto.identifier),
        osType: dto.osType,
        deadline: dto.deadline ?? null,
        customer: dto.customer.trim(),
        description: dto.description.trim(),
        durationMinutes: dto.durationMinutes,
        scheduleAt,
        scheduleTimeText: this.asNullable(dto.scheduleTime),
        collaborator: this.asNullable(dto.collaborator),
        address: this.asNullable(dto.address),
        createdById: actor.id,
        assignedToId: assignedToId ?? null,
      },
      include: baseOrderInclude,
    });
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
      return this.updateAsTechnician(existing, dto, actor);
    }

    return this.updateAsAdmin(existing, dto);
  }

  async start(
    id: string,
    dto: StartServiceOrderDto,
    actor: CurrentUserPayload,
  ) {
    const existing = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: baseOrderInclude,
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
        assignedToId: actor.id,
        status: ServiceOrderStatus.IN_PROGRESS,
      },
      include: baseOrderInclude,
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

    return updatedOrder;
  }

  private async updateAsAdmin(
    existing: { id: string; scheduleAt: Date; scheduleTimeText: string | null },
    dto: UpdateServiceOrderDto,
  ) {
    const data: {
      address?: string | null;
      assignedToId?: string | null;
      collaborator?: string | null;
      customer?: string;
      deadline?: ServiceOrderDeadline | null;
      description?: string;
      durationMinutes?: number;
      identifier?: string | null;
      osType?: ServiceOrderType;
      scheduleAt?: Date;
      scheduleTimeText?: string | null;
      status?: ServiceOrderStatus;
    } = {};

    if (dto.identifier !== undefined)
      data.identifier = this.asNullable(dto.identifier);
    if (dto.osType !== undefined) data.osType = dto.osType;
    if (dto.deadline !== undefined) data.deadline = dto.deadline;
    if (dto.customer !== undefined) data.customer = dto.customer.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.durationMinutes !== undefined)
      data.durationMinutes = dto.durationMinutes;
    if (dto.collaborator !== undefined)
      data.collaborator = this.asNullable(dto.collaborator);
    if (dto.address !== undefined) data.address = this.asNullable(dto.address);
    if (dto.status !== undefined) data.status = dto.status;

    if (dto.assignedToId !== undefined) {
      const assignedToId = this.asNullable(dto.assignedToId);
      if (assignedToId) {
        await this.assertAssignableUser(assignedToId);
        data.assignedToId = assignedToId;
      } else {
        data.assignedToId = null;
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
      include: baseOrderInclude,
    });
  }

  private async updateAsTechnician(
    existing: {
      assignedToId: string | null;
      id: string;
      status: ServiceOrderStatus;
    },
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
      include: baseOrderInclude,
    });
  }

  private async assertAssignableUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, role: true },
    });

    if (!user) {
      throw new BadRequestException('Assigned user not found');
    }
    if (!user.isActive) {
      throw new BadRequestException('Assigned user is inactive');
    }
    if (user.role !== UserRole.TECH) {
      throw new BadRequestException(
        'Only technicians can be assigned to service orders',
      );
    }
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
