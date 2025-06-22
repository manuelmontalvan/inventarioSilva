export type MovementType = 'IN' | 'OUT';

export interface InventoryMovement {
  id: string;
  type: MovementType;
  quantity: number;
  notes?: string;
  invoice_number?: string;
  orderNumber?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
  };
  locality: {
    id: string;
    name: string;
  };
}

export interface CreateInventoryMovementDto {
  type: MovementType;
  quantity: number;
  productId: string;
  localityId: string;
  invoice_number?: string;
  orderNumber?: string;
  notes?: string;
}
