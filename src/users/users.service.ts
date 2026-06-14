import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: [{ isActive: 'asc' }, { createdAt: 'desc' }],
      select: {
        clerkUserId: true,
        createdAt: true,
        email: true,
        id: true,
        imageUrl: true,
        isActive: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  findAssignableTechnicians() {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: [UserRole.SUPERVISOR, UserRole.TECH],
        },
      },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
      select: {
        email: true,
        id: true,
        imageUrl: true,
        name: true,
      },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    await this.ensureUserExists(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        clerkUserId: true,
        createdAt: true,
        email: true,
        id: true,
        imageUrl: true,
        isActive: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async updateRole(id: string, role: UserRole) {
    const existingUser = await this.ensureUserExists(id);

    return this.prisma.$transaction(async (tx) => {
      if (existingUser.email) {
        await tx.allowedEmail.updateMany({
          where: { email: existingUser.email },
          data: { role },
        });
      }

      return tx.user.update({
        where: { id },
        data: { role },
        select: {
          clerkUserId: true,
          createdAt: true,
          email: true,
          id: true,
          imageUrl: true,
          isActive: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });
    });
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true, id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
