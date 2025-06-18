
import { UserI } from './user';
import { ProductI } from './product';

export interface ProductPurchaseI {
  id: string;
  product: ProductI;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  invoice_number: string;
  supplier: SupplierI;
  purchase_date: string; // ISO 8601: '2024-06-17'
  notes?: string;
  registeredBy: UserI;
  created_at: string;
  updated_at: string;
}
export interface SupplierI {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}
