// api/purchaseOrders.ts
import axios from "axios";
import { PurchaseOrder, CreatePurchaseOrderDto } from "@/types/purchaseOrders";

const api = axios.create({
  baseURL: "http://localhost:3001/api", // Ajusta si tu base es diferente
  withCredentials: true, // Para enviar cookies HttpOnly si usas
});

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const { data } = await api.get("/purchase-orders");
  return data;
};

export const getPurchaseOrderById = async (
  id: string
): Promise<PurchaseOrder> => {
  const { data } = await api.get(`/purchase-orders/${id}`);
  return data;
};

export const createPurchaseOrder = async (
  purchaseOrder: CreatePurchaseOrderDto
): Promise<PurchaseOrder> => {
  const { data } = await api.post("/purchase-orders", purchaseOrder);
  return data;
};

export const updatePurchaseOrder = async (
  id: string,
  purchaseOrder: Partial<Omit<CreatePurchaseOrderDto, "supplierId" | "items">>
): Promise<PurchaseOrder> => {
  const { data } = await api.patch(`/purchase-orders/${id}`, purchaseOrder);
  return data;
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await api.delete(`/purchase-orders/${id}`);
};
export const uploadPurchaseOrderFile = async (
  file: File
): Promise<{ message: string; order: PurchaseOrder }> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/purchase-orders/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
