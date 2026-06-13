import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        address: dto.address.trim(),
        email: this.asNullable(dto.email),
        name: dto.name.trim(),
        phones: this.normalizePhones(dto.phones),
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.ensureCustomerExists(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
        ...(dto.email !== undefined ? { email: this.asNullable(dto.email) } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.phones !== undefined
          ? { phones: this.normalizePhones(dto.phones) }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureCustomerExists(id);

    await this.prisma.customer.delete({
      where: { id },
    });

    return { success: true };
  }

  private async ensureCustomerExists(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }

  private normalizePhones(phones?: string[]) {
    return Array.from(
      new Set((phones ?? []).map((phone) => phone.trim()).filter(Boolean)),
    );
  }

  private asNullable(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }
}
