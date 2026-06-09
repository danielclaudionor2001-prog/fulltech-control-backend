import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccessListService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.allowedEmail.findMany({
      orderBy: { email: 'asc' },
    });
  }

  async create(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.allowedEmail.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Email already allowed');
    }

    const created = await this.prisma.allowedEmail.create({
      data: { email: normalizedEmail },
    });

    await this.prisma.user.updateMany({
      where: {
        email: normalizedEmail,
        role: 'TECH',
      },
      data: {
        isActive: true,
      },
    });

    return created;
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
        role: 'TECH',
      },
      data: {
        isActive: false,
      },
    });

    return { success: true };
  }
}
