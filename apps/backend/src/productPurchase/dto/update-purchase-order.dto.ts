// src/purchases/dto/update-purchase-order.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
