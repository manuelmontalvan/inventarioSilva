import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductSaleDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSaleDto)
  productSales: CreateProductSaleDto[];

  @IsEnum(['cash', 'credit', 'transfer'])
  payment_method: 'cash' | 'credit' | 'transfer';

  @IsEnum(['paid', 'pending', 'cancelled'])
  status: 'paid' | 'pending' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;
}