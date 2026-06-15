import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  ServiceOrderStatus,
  ServiceOrderType,
  UserRole,
} from '../generated/prisma';
import { ServiceOrdersService } from './service-orders.service';

describe('ServiceOrdersService', () => {
  const createService = () => {
    const prisma = {
      serviceOrder: {
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const locationsService = {
      updateLocation: jest.fn(),
    };
    const whatsAppService = {
      sendServiceOrderCreated: jest.fn(),
      sendServiceOrderFinished: jest.fn(),
      sendServiceOrderStarted: jest.fn(),
    };

    const service = new ServiceOrdersService(
      prisma as never,
      locationsService as never,
      whatsAppService as never,
    );

    return { prisma, service, whatsAppService };
  };

  it('blocks technicians from creating service orders', async () => {
    const { prisma, service } = createService();

    await expect(
      service.create(
        {
          customer: 'Cliente teste',
          description: 'Descricao teste',
          osType: ServiceOrderType.manutencao,
          scheduleDate: '2026-06-12',
        },
        {
          clerkUserId: 'clerk-tech',
          email: 'tech@example.com',
          id: 'local-tech',
          isActive: true,
          name: 'Tecnico Teste',
          role: UserRole.TECH,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.serviceOrder.create).not.toHaveBeenCalled();
  });

  it('keeps service orders open when administrators assign a technician during creation', async () => {
    const { prisma, service, whatsAppService } = createService();

    prisma.user.findUnique.mockResolvedValue({
      clerkUserId: 'clerk-tech',
      email: 'tech@example.com',
      id: 'local-tech',
      imageUrl: null,
      isActive: true,
      name: 'Tecnico Teste',
      role: UserRole.TECH,
    });
    prisma.serviceOrder.findMany.mockResolvedValue([]);
    prisma.serviceOrder.create.mockResolvedValue({
      address: 'Rua teste, 123',
      assignedToEmail: 'tech@example.com',
      assignedToId: 'local-tech',
      assignedToName: 'Tecnico Teste',
      collaborator: null,
      completionDescription: null,
      completionPhotos: [],
      createdAt: new Date('2026-06-13T17:00:00.000Z'),
      createdByEmail: 'admin@example.com',
      createdById: 'local-admin',
      createdByName: 'Admin Teste',
      customer: 'Cliente teste',
      customerEmail: null,
      customerPhones: [],
      customerSignature: null,
      deadline: null,
      defectAdjusted: null,
      defectSolution: null,
      description: 'Descricao teste',
      durationMinutes: null,
      equipmentStatus: null,
      id: 'os-1',
      identifier: '0001',
      locationCapturedAt: null,
      locationLat: null,
      locationLng: null,
      osType: ServiceOrderType.manutencao,
      scheduleAt: new Date('2026-06-13T17:00:00.000Z'),
      scheduleTimeText: null,
      status: ServiceOrderStatus.OPEN,
      updatedAt: new Date('2026-06-13T17:00:00.000Z'),
    });
    prisma.user.findMany.mockResolvedValue([]);

    await service.create(
      {
        address: 'Rua teste, 123',
        assignedToId: 'local-tech',
        customer: 'Cliente teste',
        description: 'Descricao teste',
        osType: ServiceOrderType.manutencao,
        scheduleDate: '2026-06-13',
      },
      {
        clerkUserId: 'clerk-admin',
        email: 'admin@example.com',
        id: 'local-admin',
        isActive: true,
        name: 'Admin Teste',
        role: UserRole.ADMIN,
      },
    );

    const createCalls = prisma.serviceOrder.create.mock.calls as Array<
      [
        {
          data: {
            assignedToId: string;
            identifier: string;
            status: ServiceOrderStatus;
          };
        },
      ]
    >;
    expect(createCalls[0][0].data.assignedToId).toBe('local-tech');
    expect(createCalls[0][0].data.identifier).toBe('0001');
    expect(createCalls[0][0].data.status).toBe(ServiceOrderStatus.OPEN);
    const notificationCalls = whatsAppService.sendServiceOrderCreated.mock
      .calls as Array<
      [
        {
          customer: string;
          identifier: string | null;
          responsibleName?: string | null;
        },
      ]
    >;
    expect(notificationCalls[0][0].customer).toBe('Cliente teste');
    expect(notificationCalls[0][0].identifier).toBe('0001');
    expect(notificationCalls[0][0].responsibleName).toBe('Tecnico Teste');
  });

  it('allows supervisors to create service orders', async () => {
    const { prisma, service, whatsAppService } = createService();

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.serviceOrder.findMany.mockResolvedValue([]);
    prisma.serviceOrder.create.mockResolvedValue({
      address: null,
      assignedToEmail: null,
      assignedToId: null,
      assignedToName: null,
      collaborator: null,
      completionDescription: null,
      completionPhotos: [],
      createdAt: new Date('2026-06-14T12:00:00.000Z'),
      createdByEmail: 'supervisor@example.com',
      createdById: 'local-supervisor',
      createdByName: 'Supervisor Teste',
      customer: 'Cliente supervisor',
      customerEmail: null,
      customerPhones: [],
      customerSignature: null,
      deadline: null,
      defectAdjusted: null,
      defectSolution: null,
      description: 'Descricao supervisor',
      durationMinutes: null,
      equipmentStatus: null,
      id: 'os-supervisor',
      identifier: '0001',
      locationCapturedAt: null,
      locationLat: null,
      locationLng: null,
      osType: ServiceOrderType.manutencao,
      scheduleAt: new Date('2026-06-14T00:00:00.000Z'),
      scheduleTimeText: null,
      status: ServiceOrderStatus.OPEN,
      updatedAt: new Date('2026-06-14T12:00:00.000Z'),
    });
    prisma.user.findMany.mockResolvedValue([]);

    await service.create(
      {
        customer: 'Cliente supervisor',
        description: 'Descricao supervisor',
        osType: ServiceOrderType.manutencao,
        scheduleDate: '2026-06-14',
      },
      {
        clerkUserId: 'clerk-supervisor',
        email: 'supervisor@example.com',
        id: 'local-supervisor',
        isActive: true,
        name: 'Supervisor Teste',
        role: UserRole.SUPERVISOR,
      },
    );

    const createCalls = prisma.serviceOrder.create.mock.calls as Array<
      [
        {
          data: {
            createdById: string;
            identifier: string;
            status: ServiceOrderStatus;
          };
        },
      ]
    >;
    expect(createCalls[0][0].data.createdById).toBe('local-supervisor');
    expect(createCalls[0][0].data.identifier).toBe('0001');
    expect(createCalls[0][0].data.status).toBe(ServiceOrderStatus.OPEN);
    expect(whatsAppService.sendServiceOrderCreated).toHaveBeenCalledTimes(1);
  });

  it('generates the next sequential service order identifier', async () => {
    const { prisma, service } = createService();

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.serviceOrder.findMany.mockResolvedValue([
      { identifier: '0001' },
      { identifier: '0012' },
      { identifier: 'codigo-antigo' },
      { identifier: null },
    ]);
    prisma.serviceOrder.create.mockResolvedValue({
      address: null,
      assignedToEmail: null,
      assignedToId: null,
      assignedToName: null,
      collaborator: null,
      completionDescription: null,
      completionPhotos: [],
      createdAt: new Date('2026-06-13T17:00:00.000Z'),
      createdByEmail: 'admin@example.com',
      createdById: 'local-admin',
      createdByName: 'Admin Teste',
      customer: 'Cliente teste',
      customerEmail: null,
      customerPhones: [],
      customerSignature: null,
      deadline: null,
      defectAdjusted: null,
      defectSolution: null,
      description: 'Descricao teste',
      durationMinutes: null,
      equipmentStatus: null,
      id: 'os-13',
      identifier: '0013',
      locationCapturedAt: null,
      locationLat: null,
      locationLng: null,
      osType: ServiceOrderType.manutencao,
      scheduleAt: new Date('2026-06-13T17:00:00.000Z'),
      scheduleTimeText: null,
      status: ServiceOrderStatus.OPEN,
      updatedAt: new Date('2026-06-13T17:00:00.000Z'),
    });
    prisma.user.findMany.mockResolvedValue([]);

    await service.create(
      {
        customer: 'Cliente teste',
        description: 'Descricao teste',
        osType: ServiceOrderType.manutencao,
        scheduleDate: '2026-06-13',
      },
      {
        clerkUserId: 'clerk-admin',
        email: 'admin@example.com',
        id: 'local-admin',
        isActive: true,
        name: 'Admin Teste',
        role: UserRole.ADMIN,
      },
    );

    const createCalls = prisma.serviceOrder.create.mock.calls as Array<
      [
        {
          data: {
            identifier: string;
          };
        },
      ]
    >;
    expect(createCalls[0][0].data.identifier).toBe('0013');
  });

  it('sends WhatsApp notification when a technician finishes a service order', async () => {
    const { prisma, service, whatsAppService } = createService();

    prisma.serviceOrder.findUnique.mockResolvedValue({
      assignedToId: 'local-tech',
      id: 'os-1',
      status: ServiceOrderStatus.IN_PROGRESS,
    });
    prisma.serviceOrder.update.mockResolvedValue({
      address: 'Rua final, 456',
      assignedToEmail: 'tech@example.com',
      assignedToId: 'local-tech',
      assignedToName: 'Tecnico Teste',
      collaborator: null,
      completionDescription: 'Atendimento concluido',
      completionPhotos: [],
      createdAt: new Date('2026-06-15T12:00:00.000Z'),
      createdByEmail: 'admin@example.com',
      createdById: 'local-admin',
      createdByName: 'Admin Teste',
      customer: 'Cliente final',
      customerEmail: 'cliente@example.com',
      customerPhones: ['11999999999'],
      customerSignature: 'data:image/png;base64,assinatura',
      deadline: null,
      defectAdjusted: true,
      defectSolution: 'adjustment',
      description: 'Descricao final',
      durationMinutes: null,
      equipmentStatus: 'running',
      id: 'os-1',
      identifier: '0020',
      locationCapturedAt: null,
      locationLat: null,
      locationLng: null,
      osType: ServiceOrderType.manutencao,
      scheduleAt: new Date('2026-06-15T12:00:00.000Z'),
      scheduleTimeText: null,
      status: ServiceOrderStatus.DONE,
      updatedAt: new Date('2026-06-15T13:00:00.000Z'),
    });
    prisma.user.findMany.mockResolvedValue([]);

    await service.update(
      'os-1',
      {
        completionDescription: 'Atendimento concluido',
        customerSignature: 'data:image/png;base64,assinatura',
        defectAdjusted: true,
        defectSolution: 'adjustment',
        equipmentStatus: 'running',
        status: ServiceOrderStatus.DONE,
      },
      {
        clerkUserId: 'clerk-tech',
        email: 'tech@example.com',
        id: 'local-tech',
        isActive: true,
        name: 'Tecnico Teste',
        role: UserRole.TECH,
      },
    );

    const notificationCalls = whatsAppService.sendServiceOrderFinished.mock
      .calls as Array<
      [
        {
          completionDescription?: string | null;
          customer: string;
          identifier: string | null;
          responsibleName?: string | null;
          status?: string | null;
        },
      ]
    >;
    expect(notificationCalls[0][0].customer).toBe('Cliente final');
    expect(notificationCalls[0][0].identifier).toBe('0020');
    expect(notificationCalls[0][0].responsibleName).toBe('Tecnico Teste');
    expect(notificationCalls[0][0].completionDescription).toBe(
      'Atendimento concluido',
    );
    expect(notificationCalls[0][0].status).toBe(ServiceOrderStatus.DONE);
  });

  it('blocks technicians from finishing service orders without customer signature', async () => {
    const { prisma, service } = createService();

    prisma.serviceOrder.findUnique.mockResolvedValue({
      assignedToId: 'local-tech',
      id: 'os-1',
      status: ServiceOrderStatus.IN_PROGRESS,
    });

    await expect(
      service.update(
        'os-1',
        {
          completionDescription: 'Atendimento concluido',
          defectAdjusted: true,
          defectSolution: 'adjustment',
          equipmentStatus: 'running',
          status: ServiceOrderStatus.DONE,
        },
        {
          clerkUserId: 'clerk-tech',
          email: 'tech@example.com',
          id: 'local-tech',
          isActive: true,
          name: 'Tecnico Teste',
          role: UserRole.TECH,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.serviceOrder.update).not.toHaveBeenCalled();
  });

  it('blocks administrators from finishing service orders without customer signature', async () => {
    const { prisma, service } = createService();

    prisma.serviceOrder.findUnique.mockResolvedValue({
      assignedToId: 'local-tech',
      customerSignature: null,
      id: 'os-1',
      scheduleAt: new Date('2026-06-13T17:00:00.000Z'),
      scheduleTimeText: '17:00',
      status: ServiceOrderStatus.IN_PROGRESS,
    });

    await expect(
      service.update(
        'os-1',
        {
          status: ServiceOrderStatus.DONE,
        },
        {
          clerkUserId: 'clerk-admin',
          email: 'admin@example.com',
          id: 'local-admin',
          isActive: true,
          name: 'Admin Teste',
          role: UserRole.ADMIN,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.serviceOrder.update).not.toHaveBeenCalled();
  });

  it('allows supervisors to delete pending service orders', async () => {
    const { prisma, service } = createService();

    prisma.serviceOrder.findUnique.mockResolvedValue({
      id: 'os-1',
      status: ServiceOrderStatus.OPEN,
    });
    prisma.serviceOrder.delete.mockResolvedValue({
      id: 'os-1',
      status: ServiceOrderStatus.OPEN,
    });

    await expect(
      service.remove('os-1', {
        clerkUserId: 'clerk-supervisor',
        email: 'supervisor@example.com',
        id: 'local-supervisor',
        isActive: true,
        name: 'Supervisor Teste',
        role: UserRole.SUPERVISOR,
      }),
    ).resolves.toEqual({ success: true });

    expect(prisma.serviceOrder.delete).toHaveBeenCalledWith({
      where: { id: 'os-1' },
    });
  });

  it('blocks deletion when service order is already finalized', async () => {
    const { prisma, service } = createService();

    prisma.serviceOrder.findUnique.mockResolvedValue({
      id: 'os-1',
      status: ServiceOrderStatus.DONE,
    });

    await expect(
      service.remove('os-1', {
        clerkUserId: 'clerk-admin',
        email: 'admin@example.com',
        id: 'local-admin',
        isActive: true,
        name: 'Admin Teste',
        role: UserRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.serviceOrder.delete).not.toHaveBeenCalled();
  });
});
