// src/purchases/dto/create-purchase-order.dto.ts
import {
  IsString,
  IsOptional,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductPurchaseDto } from './create-product-purchase.dto';

export class CreatePurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsString()
  invoice_number: string;


  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Debe agregar al menos un producto a la orden.' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductPurchaseDto)
  items: CreateProductPurchaseDto[];

  @IsOptional()
  @IsDateString()
  purchase_date?: string;
}
