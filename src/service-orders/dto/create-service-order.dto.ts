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
import { ServiceOrderDeadline, ServiceOrderType } from '../../generated/prisma';

export class CreateServiceOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  identifier?: string;

  @IsEnum(ServiceOrderType)
  osType!: ServiceOrderType;

  @IsOptional()
  @IsEnum(ServiceOrderDeadline)
  deadline?: ServiceOrderDeadline;

  @IsString()
  @MaxLength(160)
  customer!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  scheduleDate!: string;

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
  @IsString()
  assignedToId?: string;
}
