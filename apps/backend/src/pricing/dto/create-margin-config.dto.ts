// create-margin-config.dto.ts
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateMarginConfigDto {
  @IsNumber()
  percentage: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string | null;
}
