import { IsEmail, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;
  
  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  roleId: string;


    @IsOptional()
  @IsDateString()
  hiredDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  lastLogin?: Date;
}
