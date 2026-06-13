import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
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

  @IsOptional()
  @IsString()
  @MaxLength(160)
  customerEmail?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  customerPhones?: string[];

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  durationMinutes?: number | string | null;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  scheduleDate!: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  scheduleTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
