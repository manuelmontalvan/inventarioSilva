// types/inventory.ts

export type MovementType = 'IN' | 'OUT';



export interface InventoryMovement {
  id: string;
  type: MovementType;
  quantity: number;
  notes?: string;
  invoice_number?: string;
  orderNumber?: string;
  createdAt: string;

  // Nuevos campos directos de la entidad
  productName?: string;
  brandName?: string;
  unitName?: string;
  shelfId?: string;  
  shelfName?: string;

  // Relaciones
  product?: {
    id: string;
    name: string;
    brand?: {
      id: string;
      name: string;
    };
    unit_of_measure?: {
      id: string;
      name: string;
      abbreviation?: string;
    };
  };

  locality?: {
    id: string;
    name: string;
  };

  shelf?: {
    id: string;
    name: string;
  };
}


export interface CreateInventoryMovementsDto {
  type: MovementType;
  movements: {
    productId: string;
    quantity: number;
    unitId: string;
    localityId: string;
    shelfId?: string;
    productName?: string;
    brandName?: string;
    unitName?: string;
  }[];
  invoice_number?: string;
  orderNumber?: string;
  notes?: string;
}

export type InventoryFormInput = {
  type: MovementType;
  movements: {
    productId: string;
    quantity: number;
    unitId: string;
    localityId: string;
    shelfId?: string;
    productName: string;
    brandName: string;
    unitName: string;
  }[];
  invoice_number?: string;
  orderNumber?: string;
  notes?: string;
};
