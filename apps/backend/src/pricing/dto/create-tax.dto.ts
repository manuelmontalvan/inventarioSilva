import { IsString, IsNumber } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  name: string;

  @IsNumber()
  rate: number; // Porcentaje, ej: 12 para 12%
}
