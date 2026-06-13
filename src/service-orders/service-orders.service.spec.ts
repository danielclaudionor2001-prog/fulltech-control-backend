import { ForbiddenException } from '@nestjs/common';
import { ServiceOrderType, UserRole } from '../generated/prisma';
import { ServiceOrdersService } from './service-orders.service';

describe('ServiceOrdersService', () => {
  const createService = () => {
    const prisma = {
      serviceOrder: {
        create: jest.fn(),
      },
    };
    const locationsService = {
      updateLocation: jest.fn(),
    };
    const whatsAppService = {
      sendServiceOrderStarted: jest.fn(),
    };

    const service = new ServiceOrdersService(
      prisma as never,
      locationsService as never,
      whatsAppService as never,
    );

    return { prisma, service };
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
});
