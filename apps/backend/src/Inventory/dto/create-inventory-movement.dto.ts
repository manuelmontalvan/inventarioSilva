import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  Min,
  IsString,
  ValidateNested,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from '../inventory-movement.entity';

class MovementItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @IsUUID()
  @IsNotEmpty()
  localityId: string;

  @IsUUID()
  shelfId: string;

  @IsString()
  @IsOptional()
  shelfName?: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  brandName?: string;

  @IsString()
  @IsOptional()
  unitName?: string;
}

export class CreateInventoryMovementsDto {
  @IsEnum(MovementType)
  @IsNotEmpty()
  type: MovementType;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MovementItemDto)
  movements: MovementItemDto[];

  @IsString()
  @IsOptional()
  invoice_number?: string;

  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
