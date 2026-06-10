import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { LocationsModule } from './locations/locations.module';
import { CustomersModule } from './customers/customers.module';
import { AccessListModule } from './access-list/access-list.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServiceOrdersModule,
    LocationsModule,
    CustomersModule,
    AccessListModule,
    WhatsAppModule,
  ],
})
export class AppModule {}
