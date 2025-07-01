import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateShelfDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  localityId: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
