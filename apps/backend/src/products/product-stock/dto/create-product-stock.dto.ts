import { IsUUID, IsInt, Min, IsNumber } from 'class-validator';

export class CreateProductStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  localityId: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  min_stock: number;

  @IsNumber()
  @Min(0)
  max_stock: number;
}
