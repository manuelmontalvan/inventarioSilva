// lib/api/marginTax.ts
import axios from "@/lib/axiosInstance"; // Ajusta según tu configuración axios

// Tipos para Margen
export interface MarginConfig {
  id: string;
  percentage: number;
  category?: { id: string; name: string } | null;
}

// Tipos para Impuesto
export interface Tax {
  id: string;
  name: string;
  rate: number; // porcentaje
}

// MÁRGENES

export const getMargins = async (): Promise<MarginConfig[]> => {
  const res = await axios.get("/pricing/margins", { withCredentials: true });
  return res.data;
};

export const createMargin = async (margin: {
  percentage: number;
  categoryId?: string | null;
}): Promise<MarginConfig> => {
  // Enviar categoryId como null si es "" o undefined para indicar margen global
  const payload = {
    percentage: margin.percentage,
    categoryId: margin.categoryId && margin.categoryId !== "" ? margin.categoryId : null,
  };
  const res = await axios.post("/pricing/margins", payload, { withCredentials: true });
  return res.data;
};

export const deleteMargin = async (id: string): Promise<null> => {
  const res = await axios.delete(`/pricing/margins/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};

// IMPUESTOS

export const getTaxes = async (): Promise<Tax[]> => {
  const res = await axios.get("/pricing/taxes", { withCredentials: true });
  return res.data;
};

export const createTax = async (tax: {
  name: string;
  rate: number;
}): Promise<Tax> => {
  const res = await axios.post("/pricing/taxes", tax, { withCredentials: true });
  return res.data;
};

export const deleteTax = async (id: string): Promise<null> => {
  const res = await axios.delete(`/pricing/taxes/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};
