// create-inventory-movement.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsUUID, IsOptional, Min, IsString } from 'class-validator';
import { MovementType } from '../inventory-movement.entity';

export class CreateInventoryMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  localityId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  invoice_number?: string;

  @IsString()
  @IsOptional()
  orderNumber?: string;
}
