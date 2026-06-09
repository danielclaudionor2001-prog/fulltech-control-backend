import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.locationsService.findAll();
  }

  @Post()
  @Roles('TECH')
  updateLocation(
    @Body() dto: UpdateLocationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.locationsService.updateLocation(user, dto.lat, dto.lng);
  }
}
