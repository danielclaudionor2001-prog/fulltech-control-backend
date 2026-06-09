import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ServiceOrderDeadline,
  ServiceOrderStatus,
  ServiceOrderType,
} from '../../generated/prisma';

export class UpdateServiceOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  identifier?: string;

  @IsOptional()
  @IsEnum(ServiceOrderType)
  osType?: ServiceOrderType;

  @IsOptional()
  @IsEnum(ServiceOrderDeadline)
  deadline?: ServiceOrderDeadline | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  customer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  scheduleDate?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  scheduleTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  collaborator?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string | null;
}
