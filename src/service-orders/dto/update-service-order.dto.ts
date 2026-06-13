import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
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
  @MaxLength(160)
  customerEmail?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  customerPhones?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  durationMinutes?: number | string | null;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  scheduleDate?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  scheduleTime?: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  completionDescription?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  completionPhotos?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100000)
  customerSignature?: string;

  @IsOptional()
  @IsBoolean()
  defectAdjusted?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  defectSolution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  equipmentStatus?: string;
}
