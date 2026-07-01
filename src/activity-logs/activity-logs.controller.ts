import {
  Body,
  Controller,
  Get,
  Param,
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
import { ActivityLogsService } from './activity-logs.service';
import { CreateUserActivityLogDto } from './dto/create-user-activity-log.dto';

@Controller('activity-logs')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post('me')
  @Roles('ADMIN', 'SUPERVISOR', 'TECH')
  createForCurrentUser(
    @Body() dto: CreateUserActivityLogDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.activityLogsService.createForCurrentUser(user, dto);
  }

  @Get('users/:userId')
  @Roles('ADMIN')
  findByUserId(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityLogsService.findByUserId(userId, limit);
  }
}
