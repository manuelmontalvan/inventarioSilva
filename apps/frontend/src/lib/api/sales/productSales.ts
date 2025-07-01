// api/sales.ts
import axios from "axios";
import { SaleI, CreateSaleDto } from "@/types/productSales";
export interface ProductSearchResult {
  product_name: string;
  brands: string[];
  units: string[];
}
const api = axios.create({
  baseURL: "http://localhost:3001/api", // Ajusta según tu configuración
  withCredentials: true, // Para enviar cookies HttpOnly si usas autenticación por cookie
});

export const getSales = async (): Promise<SaleI[]> => {
  const { data } = await api.get("/sales");
  return data;
};

export const getSaleById = async (id: string): Promise<SaleI> => {
  const { data } = await api.get(`/sales/${id}`);
  return data;
};

export const createSale = async (sale: CreateSaleDto): Promise<SaleI> => {
  const { data } = await api.post("/sales", sale);
  return data;
};

export const updateSale = async (
  id: string,
  sale: Partial<Omit<CreateSaleDto, "productSales">>
): Promise<SaleI> => {
  const { data } = await api.patch(`/sales/${id}`, sale);
  return data;
};

export const deleteSale = async (id: string): Promise<void> => {
  await api.delete(`/sales/${id}`);
};

export const searchPredictiveProducts = async (
  query: string
): Promise<ProductSearchResult[]> => {
  const res = await api.get("/sales/search", {
   
    params: { query },
  });
  return res.data;
};

export const importSalesFromExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/sales/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data; // { message: string, sale: SaleI }
};
