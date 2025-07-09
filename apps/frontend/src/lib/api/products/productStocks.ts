// lib/api/productStock.ts
import axios from '@/lib/axiosInstance'; // asumiendo que tienes axiosInstance configurado
import { ProductStock, CreateProductStockDto } from '@/types/productStock';

export const getProductStocks = async (productId?: string): Promise<ProductStock[]> => {
  const res = await axios.get('/product-stock', {
    params: productId ? { productId } : {},
    withCredentials: true,
  });
  return res.data;
};

export const createProductStock = async (data: CreateProductStockDto): Promise<ProductStock> => {
  const res = await axios.post('/product-stock', data);
  return res.data;
};

export const updateProductStock = async (
  id: string,
  data: Partial<CreateProductStockDto>
): Promise<ProductStock> => {
  const res = await axios.patch(`/product-stock/${id}`, data);
  return res.data;
};

export const deleteProductStock = async (id: string): Promise<null> => {
  const res = await axios.delete(`/product-stock/${id}`);
  return res.status === 204 ? null : res.data;
};

export const searchProductStocks = async (query: string): Promise<ProductStock[]> => {
  const res = await axios.get('/product-stock/search', {
    params: { q: query },
    withCredentials: true,
  });
  return res.data;
};