// update-role.dto.ts
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  // Para actualizar las páginas asociadas (puedes reemplazar la lista completa)
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  pageIds?: string[];
}
