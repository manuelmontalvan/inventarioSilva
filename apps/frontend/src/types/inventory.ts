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

export interface CreateInventoryMovementsDto {
  type: 'IN' | 'OUT';
  movements: {
    productId: string;
    quantity: number;
    unitId: string;
    localityId: string; // ← agregar esto por producto
    productName?: string;
    brandName?: string;
    unitName?: string;
  }[];
  invoice_number?: string;
  orderNumber?: string;
  notes?: string;
}
// types/inventory.ts

export type InventoryFormInput = {
  type: "IN" | "OUT";
  movements: {
    productId: string;
    quantity: number;
    unitId: string;
    productName: string;
    brandName: string;
    unitName: string;
  }[];
  invoice_number?: string;
  orderNumber?: string;
  notes?: string;
};
