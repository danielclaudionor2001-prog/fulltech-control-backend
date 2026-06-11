import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateAllowedEmailDto } from './dto/create-allowed-email.dto';
import { AccessListService } from './access-list.service';

@Controller('access-list')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AccessListController {
  constructor(private readonly accessListService: AccessListService) {}

  @Get()
  findAll() {
    return this.accessListService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAllowedEmailDto) {
    return this.accessListService.create(dto.email, dto.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessListService.remove(id);
  }
}
