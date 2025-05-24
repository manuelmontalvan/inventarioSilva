import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsBoolean,
  IsDateString, Min, Max
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  category_id: string;

  @IsUUID()
  brand_id: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsOptional()
  internal_code?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  current_quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_stock: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_stock: number;

  @IsString()
  @IsOptional()
  warehouse_location?: string;

  @IsUUID()
  unit_of_measure_id: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchase_price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sale_price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  profit_margin: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxes: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsDateString()
  @IsOptional()
  last_purchase_date?: string;

  @IsDateString()
  @IsOptional()
  last_sale_date?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  sales_frequency?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPerishable?: boolean;

  @IsDateString()
  @IsOptional()
  expiration_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  created_by?: string;
}
