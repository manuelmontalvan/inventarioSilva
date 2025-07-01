import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateLocalityDto {
  @IsString()
  @IsNotEmpty()
  name: string;  
}

