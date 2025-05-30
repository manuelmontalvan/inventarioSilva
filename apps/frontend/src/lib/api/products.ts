// lib/api/products.ts
import axios from '@/lib/axiosInstance'; // Asegúrate que tienes esto configurado
import { ProductI } from '@/types/product';

export const getProducts = async (): Promise<ProductI[]> => {
  const res = await axios.get('/products');
  return res.data;
};

export const createProduct = async (product: Partial<ProductI>) => {
  const res = await axios.post('/products', product);
  return res.data;
};

export const updateProduct = async (id: string, product: Partial<ProductI>) => {
  const res = await axios.put(`/products/${id}`, product);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await axios.delete(`/products/${id}`);
  return res.data;
};
