import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpsertUserRoleDto {
  @IsString()
  clerkUserId: string;

  @IsIn(['ADMIN', 'TECH'])
  role: 'ADMIN' | 'TECH';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}