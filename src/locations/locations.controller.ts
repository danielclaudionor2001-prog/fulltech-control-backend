import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateLocationStatusDto } from './dto/update-location-status.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.locationsService.findAll(user);
  }

  @Get('status')
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  async findStatuses(@CurrentUser() user: CurrentUserPayload) {
    return this.locationsService.findStatuses(user);
  }

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  async updateLocation(
    @Body() dto: UpdateLocationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.locationsService.updateLocation(user, dto.lat, dto.lng);
  }

  @Post('status')
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  async updateLocationStatus(
    @Body() dto: UpdateLocationStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.locationsService.updateLocationStatus(user, dto.status);
  }
}
