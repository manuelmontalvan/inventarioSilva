import { ProductI } from './product';
import { Locality , Shelf } from './locality';

export interface ProductStock {
  id: string;
  product: ProductI;
  locality: Locality;
  shelf: Shelf; 
  quantity: number;
  min_stock: number;
  max_stock: number;
}

export interface CreateProductStockDto {
  productId: string;
  localityId: string;
  shelfId: string; 
  quantity: number;
  min_stock: number;
  max_stock: number;
}
