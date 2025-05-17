import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  nombre: string;

  @IsNotEmpty()
  roleId: number;
}
