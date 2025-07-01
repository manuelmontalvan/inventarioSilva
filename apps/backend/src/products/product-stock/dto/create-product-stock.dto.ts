import { IsUUID, IsInt, Min, IsNumber, Validate } from 'class-validator';
import { MinMaxStockValidator } from '../min-max-stock.validator';

export class CreateProductStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  localityId: string;
  
  @IsUUID()
   shelfId: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  min_stock: number;

  @IsNumber()
  @Min(0)
  max_stock: number;

  @Validate(MinMaxStockValidator)
  dummyFieldToValidateMinMax: any; // Necesario para que class-validator ejecute la validación cruzada
}
