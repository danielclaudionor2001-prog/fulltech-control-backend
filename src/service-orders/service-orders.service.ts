import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  Prisma,
  ServiceOrder as ServiceOrderModel,
  ServiceOrderStatus,
  UserRole,
} from '../generated/prisma';
import { LocationsService } from '../locations/locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { FindServiceOrdersQueryDto } from './dto/find-service-orders-query.dto';
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

const MAX_IDENTIFIER_CREATE_ATTEMPTS = 5;

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locationsService: LocationsService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async findAll(
    actor: CurrentUserPayload,
    query: FindServiceOrdersQueryDto = {},
  ) {
    const visibilityWhere: Prisma.ServiceOrderWhereInput =
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
    const filterWhere = this.buildFindWhere(query);
    const where: Prisma.ServiceOrderWhereInput =
      Object.keys(filterWhere).length > 0
        ? { AND: [visibilityWhere, filterWhere] }
        : visibilityWhere;

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
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can create service orders',
      );
    }

    const scheduleAt = this.buildScheduleAt(dto.scheduleDate, dto.scheduleTime);
    const assignedTo = await this.resolveAssignableUser(
      this.asNullable(dto.assignedToId),
    );

    let createdOrder: ServiceOrderModel | null = null;

    const baseData = {
      address: this.asNullable(dto.address),
      assignedToEmail: assignedTo?.email ?? null,
      assignedToId: assignedTo?.id ?? null,
      assignedToName: assignedTo?.name ?? null,
      createdByEmail: actor.email ?? null,
      createdById: actor.id,
      createdByName: actor.name ?? null,
      customer: dto.customer.trim(),
      customerEmail: this.asNullable(dto.customerEmail),
      customerPhones: this.normalizeStringList(dto.customerPhones),
      deadline: dto.deadline ?? null,
      description: dto.description.trim(),
      durationMinutes: this.normalizeDurationMinutes(dto.durationMinutes),
      osType: dto.osType,
      scheduleAt,
      scheduleTimeText: this.asNullable(dto.scheduleTime),
      status: ServiceOrderStatus.OPEN,
    };

    for (
      let attempt = 0;
      attempt < MAX_IDENTIFIER_CREATE_ATTEMPTS;
      attempt += 1
    ) {
      try {
        createdOrder = await this.prisma.serviceOrder.create({
          data: {
            ...baseData,
            identifier: await this.generateNextIdentifier(),
          },
        });
        break;
      } catch (error) {
        if (
          attempt < MAX_IDENTIFIER_CREATE_ATTEMPTS - 1 &&
          this.isIdentifierUniqueConflict(error)
        ) {
          continue;
        }

        this.handlePrismaWriteError(error);
      }
    }

    if (!createdOrder) {
      throw new ConflictException(
        'Nao foi possivel gerar um identificador para esta ordem de servico. Tente novamente.',
      );
    }

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

    if (actor.role !== UserRole.ADMIN) {
      const updatedOrder = await this.updateAsTechnician(existing, dto, actor);
      return this.decorateServiceOrder(updatedOrder);
    }

    let updatedOrder: ServiceOrderModel;

    try {
      updatedOrder = await this.updateAsAdmin(existing, dto);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }

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
      existing.status === ServiceOrderStatus.WITH_PENDING ||
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

    await this.locationsService.ensureWithinCustomerRange(
      existing.address ?? null,
      dto.lat,
      dto.lng,
    );

    const updatedOrder = await this.prisma.serviceOrder.update({
      where: { id: existing.id },
      data: {
        assignedToEmail: actor.email ?? null,
        assignedToId: actor.id,
        assignedToName: actor.name ?? null,
        locationCapturedAt: new Date(),
        locationLat: dto.lat,
        locationLng: dto.lng,
        status: ServiceOrderStatus.IN_PROGRESS,
      },
    });

    await this.locationsService.updateLocation(actor, dto.lat, dto.lng, {
      address: updatedOrder.address ?? null,
      customer: updatedOrder.customer,
      id: updatedOrder.id,
      identifier: updatedOrder.identifier ?? null,
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
      | 'assignedToId'
      | 'customerSignature'
      | 'id'
      | 'scheduleAt'
      | 'scheduleTimeText'
      | 'status'
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
    if (dto.customerEmail !== undefined) {
      data.customerEmail = this.asNullable(dto.customerEmail);
    }
    if (dto.customerPhones !== undefined) {
      data.customerPhones = this.normalizeStringList(dto.customerPhones);
    }
    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }
    if (dto.durationMinutes !== undefined) {
      data.durationMinutes = this.normalizeDurationMinutes(dto.durationMinutes);
    }
    if (dto.address !== undefined) {
      data.address = this.asNullable(dto.address);
    }
    if (dto.completionDescription !== undefined) {
      data.completionDescription = this.asNullable(dto.completionDescription);
    }
    if (dto.completionPhotos !== undefined) {
      data.completionPhotos = this.normalizeStringList(dto.completionPhotos);
    }
    if (dto.customerSignature !== undefined) {
      data.customerSignature = this.asNullable(dto.customerSignature);
    }
    if (dto.defectAdjusted !== undefined) {
      data.defectAdjusted = dto.defectAdjusted;
    }
    if (dto.defectSolution !== undefined) {
      data.defectSolution = this.asNullable(dto.defectSolution);
    }
    if (dto.equipmentStatus !== undefined) {
      data.equipmentStatus = this.asNullable(dto.equipmentStatus);
    }
    if (dto.status !== undefined) {
      this.ensureCanSetFinalStatus(dto.status, {
        customerSignature:
          this.asNullable(dto.customerSignature) ?? existing.customerSignature,
      });
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
      'customerEmail',
      'customerPhones',
      'description',
      'durationMinutes',
      'scheduleDate',
      'scheduleTime',
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
      existing.status === ServiceOrderStatus.WITH_PENDING ||
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
      dto.status !== ServiceOrderStatus.DONE &&
      dto.status !== ServiceOrderStatus.WITH_PENDING
    ) {
      throw new ForbiddenException(
        'Technicians can only keep progress or finish the service order',
      );
    }

    const isFinalStatus =
      dto.status === ServiceOrderStatus.DONE ||
      dto.status === ServiceOrderStatus.WITH_PENDING;
    if (isFinalStatus) {
      this.validateTechnicianConclusion(dto);
    }

    const data: Prisma.ServiceOrderUpdateInput = {
      status: dto.status,
    };

    if (dto.completionDescription !== undefined) {
      data.completionDescription = this.asNullable(dto.completionDescription);
    }
    if (dto.completionPhotos !== undefined) {
      data.completionPhotos = this.normalizeStringList(dto.completionPhotos);
    }
    if (dto.customerSignature !== undefined) {
      data.customerSignature = this.asNullable(dto.customerSignature);
    }
    if (dto.defectAdjusted !== undefined) {
      data.defectAdjusted = dto.defectAdjusted;
    }
    if (dto.defectSolution !== undefined) {
      data.defectSolution = this.asNullable(dto.defectSolution);
    }
    if (dto.equipmentStatus !== undefined) {
      data.equipmentStatus = this.asNullable(dto.equipmentStatus);
    }

    return this.prisma.serviceOrder.update({
      where: { id: existing.id },
      data,
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

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException(
        'Assigned user must be a technician or supervisor',
      );
    }

    return this.toActorSnapshot(user);
  }

  private buildFindWhere(query: FindServiceOrdersQueryDto) {
    const where: Prisma.ServiceOrderWhereInput = {};

    if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    if (query.customer?.trim()) {
      where.customer = {
        contains: query.customer.trim(),
        mode: 'insensitive',
      };
    }

    if (query.startDate || query.endDate) {
      const startDate = query.startDate
        ? this.parseDateBoundary(query.startDate, 'start')
        : null;
      const endDate = query.endDate
        ? this.parseDateBoundary(query.endDate, 'end')
        : null;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Invalid date range');
      }

      where.scheduleAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    return where;
  }

  private ensureCanSetFinalStatus(
    status: ServiceOrderStatus,
    data: { customerSignature?: string | null },
  ) {
    const isFinalStatus =
      status === ServiceOrderStatus.DONE ||
      status === ServiceOrderStatus.WITH_PENDING;

    if (isFinalStatus && !data.customerSignature) {
      throw new BadRequestException(
        'Customer signature is required to finish the service order',
      );
    }
  }

  private validateTechnicianConclusion(dto: UpdateServiceOrderDto) {
    if (!this.asNullable(dto.completionDescription)) {
      throw new BadRequestException('Completion description is required');
    }

    if (dto.defectAdjusted === undefined) {
      throw new BadRequestException('Defect status is required');
    }

    if (!this.asNullable(dto.defectSolution)) {
      throw new BadRequestException('Defect solution is required');
    }

    if (!this.asNullable(dto.equipmentStatus)) {
      throw new BadRequestException('Equipment status is required');
    }

    if (!this.asNullable(dto.customerSignature)) {
      throw new BadRequestException(
        'Customer signature is required to finish the service order',
      );
    }
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

  private parseDateBoundary(value: string, boundary: 'end' | 'start') {
    const suffix = boundary === 'start' ? 'T00:00:00.000' : 'T23:59:59.999';
    const date = new Date(`${value}${suffix}`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid filter date');
    }

    return date;
  }

  private normalizeStringList(values?: string[]) {
    return Array.from(
      new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
    );
  }

  private normalizeDurationMinutes(value?: number | string | null) {
    const duration = Number(value);
    return Number.isInteger(duration) && duration > 0 ? duration : 1;
  }

  private async generateNextIdentifier() {
    const existingIdentifiers = await this.prisma.serviceOrder.findMany({
      where: {
        identifier: {
          not: null,
        },
      },
      select: {
        identifier: true,
      },
    });
    const highestIdentifier = existingIdentifiers.reduce((highest, order) => {
      const identifier = order.identifier?.trim();

      if (!identifier || !/^\d+$/.test(identifier)) {
        return highest;
      }

      return Math.max(highest, Number(identifier));
    }, 0);

    return String(highestIdentifier + 1).padStart(4, '0');
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

  private handlePrismaWriteError(error: unknown): never {
    if (this.isIdentifierUniqueConflict(error)) {
      throw new ConflictException(
        'Ja existe uma ordem de servico com esse identificador. Informe outro identificador ou deixe o campo em branco.',
      );
    }

    throw error;
  }

  private isIdentifierUniqueConflict(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const meta = error.meta as
        | {
            driverAdapterError?: {
              constraint?: {
                fields?: string[];
              };
            };
            target?: string[];
          }
        | undefined;
      const fields = Array.isArray(meta?.target)
        ? meta.target
        : Array.isArray(meta?.driverAdapterError?.constraint?.fields)
          ? meta.driverAdapterError.constraint.fields
          : [];

      if (fields.includes('identifier')) {
        return true;
      }
    }

    return false;
  }
}
