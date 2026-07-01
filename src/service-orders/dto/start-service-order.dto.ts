import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsOptional } from 'class-validator';

export class StartServiceOrderDto {
  @Type(() => Number)
  @IsOptional()
  @IsLatitude()
  lat?: number;

  @Type(() => Number)
  @IsOptional()
  @IsLongitude()
  lng?: number;
}
