import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccessListService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.allowedEmail.findMany({
      orderBy: [{ role: 'asc' }, { email: 'asc' }],
    });
  }

  async create(email: string, role: UserRole) {
    const normalizedEmail = email.trim().toLowerCase();

    const saved = await this.prisma.allowedEmail.upsert({
      where: { email: normalizedEmail },
      update: { role },
      create: {
        email: normalizedEmail,
        role,
      },
    });

    await this.prisma.user.updateMany({
      where: {
        email: normalizedEmail,
      },
      data: {
        isActive: true,
        role,
      },
    });

    return saved;
  }

  async remove(id: string) {
    const allowedEmail = await this.prisma.allowedEmail.findUnique({
      where: { id },
    });

    if (!allowedEmail) {
      throw new NotFoundException('Allowed email not found');
    }

    await this.prisma.allowedEmail.delete({
      where: { id },
    });

    await this.prisma.user.updateMany({
      where: {
        email: allowedEmail.email,
      },
      data: {
        isActive: false,
        role: UserRole.TECH,
      },
    });

    return { success: true };
  }
}
