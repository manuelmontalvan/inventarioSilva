import axios from "@/lib/axiosInstance";
import {
  SaleI,
  CreateSaleDto,
  SoldProduct,
  SalePriceTrendItem,
  SaleQuantityTrendItem,
} from "@/types/productSales";
export interface ProductSearchResult {
  product_name: string;
  brands: string[];
  units: string[];
}

export interface SaleHistoryItem {
  productName: string;
  customerName: string;
  invoiceNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: string;
  notes: string;
  orderNumber: string;
}

export interface SaleTrendItem {
  month: string; // "2025-07"
  unitPrice: number;
}

export const getSales = async (): Promise<SaleI[]> => {
  const { data } = await axios.get("/sales");
  return data;
};

export const getSaleById = async (id: string): Promise<SaleI> => {
  const { data } = await axios.get(`/sales/${id}`);
  return data;
};

export const createSale = async (sale: CreateSaleDto): Promise<SaleI> => {
  const { data } = await axios.post("/sales", sale);
  return data;
};

export const updateSale = async (
  id: string,
  sale: Partial<Omit<CreateSaleDto, "productSales">>
): Promise<SaleI> => {
  const { data } = await axios.patch(`/sales/${id}`, sale);
  return data;
};

export const deleteSale = async (id: string): Promise<void> => {
  await axios.delete(`/sales/${id}`);
};

export const deleteAllSales = async (): Promise<void> => {
  await axios.delete("/sales/all");
};

export const searchPredictiveProducts = async (
  query: string
): Promise<ProductSearchResult[]> => {
  const { data } = await axios.get("/sales/search", {
    params: { query },
  });
  return data;
};

export const importSalesFromExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post("/sales/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const getSaleHistory = async (
  productId?: string,
  startDate?: string,
  endDate?: string
): Promise<SaleHistoryItem[]> => {
  const { data } = await axios.get("/sales/history/by-product", {
    params: { productId, startDate, endDate },
  });
  return data;
};

export const getSalePriceTrend = async (
  productId: string
): Promise<SalePriceTrendItem[]> => {
  const { data } = await axios.get(`/sales/trend/${productId}`);
  return data;
};

export const getTopSoldProducts = async (
  startMonth?: string,
  endMonth?: string,
  limit = 20
): Promise<
  {
    productId: string;
    productName: string;
    brandName: string;
    unitName: string;
    totalQuantity: number;
  }[]
> => {
  const params: Record<string, string | number> = { limit };
  if (startMonth) params.startMonth = startMonth;
  if (endMonth) params.endMonth = endMonth;

  const { data } = await axios.get("/sales/top-products", { params });
  return data;
};

export const getMonthlySalesTrend = async (
  productId: string
): Promise<SaleQuantityTrendItem[]> => {
  const { data } = await axios.get(`/sales/${productId}/monthly-sales-trend`);
  return data;
};

export const getSoldProducts = async (): Promise<SoldProduct[]> => {
  const { data } = await axios.get("/sales/products");
  return data;
};
