import { Injectable, Logger } from '@nestjs/common';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Prisma } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserActivityLogDto } from './dto/create-user-activity-log.dto';

type RecordActivityLogInput = {
  actorId?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
  type: string;
  userId: string;
};

const DEFAULT_LOG_LIMIT = 80;
const MAX_LOG_LIMIT = 200;

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createForCurrentUser(
    user: CurrentUserPayload,
    dto: CreateUserActivityLogDto,
  ) {
    return this.record({
      actorId: user.id,
      message: dto.message,
      metadata: {
        ...(dto.metadata ?? {}),
        level: dto.level ?? 'info',
        source: dto.source ?? null,
      },
      type: dto.event,
      userId: user.id,
    });
  }

  async findByUserId(userId: string, rawLimit?: string | number) {
    const limit = this.normalizeLimit(rawLimit);

    try {
      return await this.prisma.userActivityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to read activity logs for user ${userId}: ${String(error)}`,
      );
      return [];
    }
  }

  async record(input: RecordActivityLogInput) {
    try {
      return await this.prisma.userActivityLog.create({
        data: {
          actorId: input.actorId ?? null,
          message: input.message,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
          type: input.type,
          userId: input.userId,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to write activity log for user ${input.userId}: ${String(
          error,
        )}`,
      );
      return null;
    }
  }

  private normalizeLimit(rawLimit?: string | number) {
    const limit = Number(rawLimit);

    if (!Number.isFinite(limit)) {
      return DEFAULT_LOG_LIMIT;
    }

    return Math.max(1, Math.min(MAX_LOG_LIMIT, Math.trunc(limit)));
  }
}
