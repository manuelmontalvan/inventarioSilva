// types/product.ts
export interface ProductI {
  id: string;
  name: string;
  description?: string;
  barcode: string;
  internal_code?: string;
  image?: string;
  current_quantity: number;
  min_stock: number;
  max_stock: number;
  warehouse_location?: string;
  purchase_price: number;
  sale_price: number;
  profit_margin: number;
  taxes: number;
  discount?: number;
  entry_date: string;
  last_updated: string;
  last_purchase_date?: string;
  last_sale_date?: string;
  sales_frequency: number;
  isActive: boolean;
  isPerishable: boolean;
  expiration_date?: string;
  notes?: string;
  current_trend?: 'growing' | 'declining' | 'stable';
created_by?: string;
  updated_by?: string;
  category: { id: string; name: string };
  brand: { id: string; name: string };
  unit_of_measure: { id: string; name: string };
}
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