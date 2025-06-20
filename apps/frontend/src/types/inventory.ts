// types/inventory.ts
export type MovementType = 'IN' | 'OUT';

export interface InventoryMovement {
  id: string;
  type: MovementType;
  quantity: number;
  notes?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
  };
}

export interface CreateInventoryMovementDto {
  type: MovementType;
  quantity: number;
  productId: string;
  notes?: string;
}
