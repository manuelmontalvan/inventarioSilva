import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateSaleDto {
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @IsOptional()
  @IsEnum(['paid', 'pending', 'cancelled'])
  status?: 'paid' | 'pending' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;
}
