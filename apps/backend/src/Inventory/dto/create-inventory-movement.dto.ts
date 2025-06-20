// create-inventory-movement.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsUUID, IsOptional, Min } from 'class-validator';
import { MovementType } from '../inventory-movement.entity';

export class CreateInventoryMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsUUID()
  productId: string;

  @IsOptional()
  notes?: string;
}
