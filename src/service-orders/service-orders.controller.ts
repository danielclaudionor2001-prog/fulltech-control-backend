import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { FindServiceOrdersQueryDto } from './dto/find-service-orders-query.dto';
import { StartServiceOrderDto } from './dto/start-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrdersService } from './service-orders.service';

@Controller('service-orders')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: FindServiceOrdersQueryDto,
  ) {
    return this.serviceOrdersService.findAll(user, query);
  }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR')
  create(
    @Body() dto: CreateServiceOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceOrdersService.create(dto, user);
  }

  @Post(':id/start')
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  start(
    @Param('id') id: string,
    @Body() dto: StartServiceOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceOrdersService.start(id, dto, user);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceOrdersService.update(id, dto, user);
  }
}
