import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export class CreateUserActivityLogDto {
  @IsString()
  @MaxLength(100)
  event!: string;

  @IsOptional()
  @IsIn(LOG_LEVELS)
  level?: string;

  @IsString()
  @MaxLength(500)
  message!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}
