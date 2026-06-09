import { IsEnum } from 'class-validator';
import { UserRole } from '../../generated/prisma';

export class UpsertUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
