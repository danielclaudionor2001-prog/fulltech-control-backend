import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceOrdersService {
    constructor(private readonly prisma: PrismaService) { }
}
