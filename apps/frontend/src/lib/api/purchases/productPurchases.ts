// lib/api/productPurchases.ts
import axios from '@/lib/axiosInstance';
import { ProductPurchaseI } from '@/types/productPurchases';

export const getProductPurchases = async (): Promise<ProductPurchaseI[]> => {
  const res = await axios.get('/product-purchases');
  return res.data;
};

export const getProductPurchaseById = async (id: string): Promise<ProductPurchaseI> => {
  const res = await axios.get(`/product-purchases/${id}`);
  return res.data;
};

export const createProductPurchase = async (purchase: Partial<ProductPurchaseI>): Promise<ProductPurchaseI> => {
  const res = await axios.post('/product-purchases', purchase);
  return res.data;
};

export const updateProductPurchase = async (id: string, purchase: Partial<ProductPurchaseI>): Promise<ProductPurchaseI> => {
  const res = await axios.patch(`/product-purchases/${id}`, purchase);
  return res.data;
};

export const deleteProductPurchase = async (id: string): Promise<void> => {
  await axios.delete(`/product-purchases/${id}`);
};
