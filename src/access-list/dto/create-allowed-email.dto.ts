import { UserRole } from '../../generated/prisma';
import { IsEmail, IsEnum } from 'class-validator';

export class CreateAllowedEmailDto {
  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
