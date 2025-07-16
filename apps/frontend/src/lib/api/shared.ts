// lib/api/shared.ts
import axios from '../axiosInstance';

export type OrderItem = {
  productId: string;
  productName: string;
  brand?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
};
export type TotalProductsResponse = {
  total: number;
};

export type MonthlySalesPurchases = {
  month: string;
  totalPurchases: number;
  totalSales: number;
}[];
export type OrderDetailsResponse =
  | {
      type: 'purchase';
      orderNumber: string;
      items: OrderItem[];
    }
  | {
      type: 'sale';
      orderNumber: string;
      items: OrderItem[];
    };

export const getOrderDetailsByOrderNumber = async (
  orderNumber: string
): Promise<OrderDetailsResponse> => {
  const { data } = await axios.get(`/shared/by-number/${orderNumber}`);
  return data;
};

export const getMonthlySalesAndPurchases = async (
  startMonth?: string,
  endMonth?: string
): Promise<MonthlySalesPurchases> => {
  const params: Record<string, string> = {};
  if (startMonth) params.startMonth = startMonth;
  if (endMonth) params.endMonth = endMonth;

  const { data } = await axios.get('/shared/monthly-sales-purchases', { params });
  return data;
};

export const getTotalProducts = async (): Promise<TotalProductsResponse> => {
  const { data } = await axios.get('/shared/total-products');
  return data;
};
export const getAvailableMonths = async (): Promise<string[]> => {
  const { data } = await axios.get('/shared/available-months');
  return data;
};

