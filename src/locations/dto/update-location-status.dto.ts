import { IsEnum } from 'class-validator';
import { LocationSignalStatus } from '../../generated/prisma';

export class UpdateLocationStatusDto {
  @IsEnum(LocationSignalStatus)
  status!: LocationSignalStatus;
}
