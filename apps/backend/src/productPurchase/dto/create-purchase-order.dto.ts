// src/purchases/dto/create-purchase-order.dto.ts
import {
  IsString,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductPurchaseDto } from './create-product-purchase.dto';

export class CreatePurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsString()
  invoice_number: string;

  @IsDateString()
  purchase_date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Debe agregar al menos un producto a la orden.' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductPurchaseDto)
  items: CreateProductPurchaseDto[];
}
