import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');
    if (!url) {
      throw new Error(
        'DATABASE_URL não encontrado. Verifique o .env na raiz do projeto.',
      );
    }

    const adapter = new PrismaNeon({ connectionString: url });
    super({ adapter });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
