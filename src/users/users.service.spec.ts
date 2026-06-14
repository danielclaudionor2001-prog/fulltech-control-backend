import { UserRole } from '../generated/prisma';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const createService = () => {
    const tx = {
      allowedEmail: {
        upsert: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
    };
    type MockTransaction = typeof tx;
    const prisma = {
      $transaction: jest.fn(
        <T>(callback: (transaction: MockTransaction) => T) => callback(tx),
      ),
      user: {
        findUnique: jest.fn(),
      },
    };
    const service = new UsersService(prisma as never);

    return { prisma, service, tx };
  };

  it('updates the local user role and matching allowed email role', async () => {
    const { prisma, service, tx } = createService();

    prisma.user.findUnique.mockResolvedValue({
      email: 'tech@example.com',
      id: 'local-tech',
    });
    tx.user.update.mockResolvedValue({
      clerkUserId: 'clerk-tech',
      createdAt: new Date('2026-06-13T17:00:00.000Z'),
      email: 'tech@example.com',
      id: 'local-tech',
      imageUrl: null,
      isActive: true,
      name: 'Tecnico Teste',
      role: UserRole.SUPERVISOR,
      updatedAt: new Date('2026-06-13T17:00:00.000Z'),
    });

    await service.updateRole('local-tech', UserRole.SUPERVISOR);

    expect(tx.allowedEmail.upsert).toHaveBeenCalledWith({
      where: { email: 'tech@example.com' },
      update: { role: UserRole.SUPERVISOR },
      create: {
        email: 'tech@example.com',
        role: UserRole.SUPERVISOR,
      },
    });
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'local-tech' },
        data: { role: UserRole.SUPERVISOR },
      }),
    );
  });
});
