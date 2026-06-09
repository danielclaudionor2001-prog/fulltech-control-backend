import { IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsString()
  @MaxLength(255)
  address!: string;
}
