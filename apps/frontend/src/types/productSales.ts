// types/sales.ts
import {UserI} from "./user"

export interface ProductSale {
  id: string;
  productId: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}
export interface Customer {
  id: string;
  name: string;
  // Otros campos que tengas en Customer
}

export interface ProductSale {
  id: string;
  productId: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  // Otros campos según tu entidad ProductSale
}


export interface SaleI {
  id: string;
  productSales: ProductSale[];
  customer?: Customer; // Aquí agregas el objeto customer completo
  customerId?: string;  // Opcional mantener ID aparte
  total_amount: number;
  payment_method: 'Efectivo' | 'credito' | 'transferencia';
  status: 'Pagado' | 'Pendiente' | 'cancelado';
  notes?: string;
  soldBy?: UserI;
  sale_date: string; 
  created_at: string;
  updated_at: string;
  orderNumber?: string;
}


// DTO para creación de venta
export interface CreateProductSaleDto {
  productId: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface CreateSaleDto {
  customerId?: string;
  productSales: CreateProductSaleDto[];
  payment_method: 'cash' | 'credit' | 'transfer';
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
}
