import { ProductI, Brand, UnitOfMeasure } from './product';
import { UserI } from './user';
import { SupplierI } from './supplier';


export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  invoice_number: string;
  supplier: SupplierI;
  purchase_date: string;
  notes?: string;
  registeredBy: UserI;
  purchase_lines: ProductPurchaseI[];
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  invoice_number: string;
  notes?: string;
  items: CreateProductPurchaseDto[];
}

export interface UpdatePurchaseOrderDto {
  invoice_number?: string;
  purchase_date?: string;
  notes?: string;
  // Puedes agregar edición de items más adelante si lo necesitas
}

export interface CreateProductPurchaseDto {
  productId: string;
  invoice_number: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
  supplierId: string;
  unit_id?: string; // <--- si quieres enviar el id de unidad (relación FK)
  brand_id?: string; // <--- si necesitas enviar el id de marca (relación FK)
}

export interface ProductPurchaseI {
  id: string;
  product: ProductI & {
    brand?: Brand;
    unit_of_measure?: UnitOfMeasure;
  };
  supplier: SupplierI;
  invoice_number: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
  notes?: string;
  registeredBy: UserI;
  created_at: string;
  updated_at: string;
}
