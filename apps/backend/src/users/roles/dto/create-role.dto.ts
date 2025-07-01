// create-role.dto.ts
import { IsString, IsNotEmpty, IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;


  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  pageIds?: string[];
}
