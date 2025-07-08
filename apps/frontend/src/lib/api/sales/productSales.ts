// lib/api/sales.ts
import axios from "@/lib/axiosInstance"; // 🔄 Usa tu instancia configurada
import { SaleI, CreateSaleDto } from "@/types/productSales";

export interface ProductSearchResult {
  product_name: string;
  brands: string[];
  units: string[];
}

// 👉 Obtener todas las ventas
export const getSales = async (): Promise<SaleI[]> => {
  const { data } = await axios.get("/sales");
  return data;
};

// 👉 Obtener una venta por ID
export const getSaleById = async (id: string): Promise<SaleI> => {
  const { data } = await axios.get(`/sales/${id}`);
  return data;
};

// 👉 Crear una venta
export const createSale = async (sale: CreateSaleDto): Promise<SaleI> => {
  const { data } = await axios.post("/sales", sale);
  return data;
};

// 👉 Actualizar una venta
export const updateSale = async (
  id: string,
  sale: Partial<Omit<CreateSaleDto, "productSales">>
): Promise<SaleI> => {
  const { data } = await axios.patch(`/sales/${id}`, sale);
  return data;
};

// 👉 Eliminar una venta
export const deleteSale = async (id: string): Promise<void> => {
  await axios.delete(`/sales/${id}`);
};

// 👉 Búsqueda predictiva para productos
export const searchPredictiveProducts = async (
  query: string
): Promise<ProductSearchResult[]> => {
  const { data } = await axios.get("/sales/search", {
    params: { query },
  });
  return data;
};

// 👉 Importar ventas desde Excel
export const importSalesFromExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post("/sales/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data; // { message: string, sale: SaleI }
};
