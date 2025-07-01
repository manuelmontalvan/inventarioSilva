// types/sales.ts
import { UserI } from "./user";
import { ProductI } from "./product";

export interface ProductSale {
  id: string;
  productId: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  invoice_number?: string; // Nuevo campo
  sale_date?: string; // Fecha en formato ISO string
  product?: ProductI;
  product_name?: string; // Nombre del producto, opcional  
  brand_name?: string; // Marca del producto, opcional
  unit_of_measure_name?: string; // Unidad del producto, opcional
}

export interface Customer {
  id: string;
  name: string;
  // Otros campos que tengas en Customer
}

export interface SaleI {
  id: string;
  productSales: ProductSale[];
  customer?: Customer; // Objeto customer completo
  customerId?: string; // Opcional mantener ID aparte
  total_amount: number;
  payment_method: "cash" | "credit" | "transfer"; // Conservar en inglés para coincidir con backend
  status: "paid" | "pending" | "cancelled"; // En inglés igual
  notes?: string;
  soldBy?: UserI;
  sale_date: string;
  created_at: string;
  updated_at: string;
  orderNumber?: string;
  invoice_number?: string; // Nuevo campo para venta
}

// DTO para creación de venta
export interface CreateProductSaleDto {
  productId: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  sale_date?: string;
  invoice_number?: string;
}

export interface CreateSaleDto {
  customerId?: string;
  productSales: CreateProductSaleDto[];
  payment_method: "cash" | "credit" | "transfer";
  status: "paid" | "pending" | "cancelled";
  notes?: string;
  invoice_number?: string;
}
