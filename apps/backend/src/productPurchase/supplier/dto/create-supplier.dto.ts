import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {

  @IsString()
  identification: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contact_person?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
