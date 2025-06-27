import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductPurchaseDto {
  @IsUUID()
  productId: string;
  
  @IsOptional()
  @IsString()
  product_name?: string;

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

  // Nuevos campos para marca y unidad de medida
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  unitOfMeasureId?: string;
}
