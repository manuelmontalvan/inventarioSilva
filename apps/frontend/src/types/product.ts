// types/product.ts
import { UserI } from "./user"; // Tu interfaz de usuario
import {ProductStock} from './productStock'

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
}
export interface Locality {
  id: string;
  name: string;    
}
export interface ProductI {
  id: string;
  name: string;
  description?: string;
  category: Category; // Objeto completo debido a eager loading
  brand: Brand; // Objeto completo
  internal_code?: string;
  image?: string;
  current_quantity: number;
  min_stock: number;
  max_stock: number;
  locality?: Locality; // Objeto completo, puede ser null
  unit_of_measure: UnitOfMeasure; // Objeto completo
  purchase_price: number;
  sale_price: number;
  profit_margin: number; // Calculado en el backend
  entry_date: string; // O Date, dependiendo de cómo manejes las fechas (string para ISO)
  last_updated: string;
  last_purchase_date?: string;
  last_sale_date?: string;
  sales_frequency: number;
  isActive: boolean;
  isPerishable: boolean;
  expiration_date?: string;
  notes?: string;
  current_trend?: "growing" | "declining" | "stable";
  createdBy: UserI; // Objeto completo debido a eager loading
  updatedBy: UserI; // Objeto completo
   stocks?: ProductStock[];
}
