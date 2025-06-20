// src/purchases/dto/create-product-purchase.dto.ts

import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductPurchaseDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  supplierId: string;

  @IsString()
  invoice_number: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_cost: number;

  @IsNumber()
  @Min(0)
  total_cost: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
