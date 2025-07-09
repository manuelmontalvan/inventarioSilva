import axios from "@/lib/axiosInstance";
import { PurchaseOrder, CreatePurchaseOrderDto } from "@/types/purchaseOrders";

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const { data } = await axios.get("/purchase-orders"); 
  return data;
};

export const getPurchaseOrderById = async (
  id: string
): Promise<PurchaseOrder> => {
  const { data } = await axios.get(`/purchase-orders/${id}`);
  return data;
};

export const createPurchaseOrder = async (
  purchaseOrder: CreatePurchaseOrderDto
): Promise<PurchaseOrder> => {
  const { data } = await axios.post("/purchase-orders", purchaseOrder);
  return data;
};

export const updatePurchaseOrder = async (
  id: string,
  purchaseOrder: Partial<Omit<CreatePurchaseOrderDto, "supplierId" | "items">>
): Promise<PurchaseOrder> => {
  const { data } = await axios.patch(`/purchase-orders/${id}`, purchaseOrder);
  return data;
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await axios.delete(`/purchase-orders/${id}`);
};

export const uploadPurchaseOrderFile = async (
  file: File
): Promise<{ message: string; order: PurchaseOrder }> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post("/purchase-orders/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
