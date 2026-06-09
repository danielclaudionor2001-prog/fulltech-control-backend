import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

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
        name: dto.name.trim(),
      },
    });
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    return { success: true };
  }
}
