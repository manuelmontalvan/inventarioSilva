import { ProductI } from './product';
import { Locality } from './locality';

export interface ProductStock {
  id: string;
  product: ProductI;
  locality: Locality;
  quantity: number;
  min_stock: number;
  max_stock: number;
}
export interface CreateProductStockDto {
  productId: string;
  localityId: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
}
