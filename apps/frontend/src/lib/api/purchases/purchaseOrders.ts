import axios from "@/lib/axiosInstance";
import { PurchaseOrder, CreatePurchaseOrderDto } from "@/types/purchaseOrders";
import { ProductI } from "@/types/product";

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
  try {
    await axios.delete(`/purchase-orders/${id}`);
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    throw error;
  }
};
export const clearAllPurchaseOrders = async (): Promise<void> => {
  await axios.delete("/purchase-orders");
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

export const getPurchaseHistory = async (params?: {
  productId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<
  {
    productName: string;
    supplierName: string;
    invoiceNumber: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    purchaseDate: string;
    notes: string;
    orderNumber: string;
  }[]
> => {
  // Si params es undefined, enviamos un objeto vacío
  const filteredParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([value]) => value !== undefined && value !== ""
        )
      )
    : {};

  const { data } = await axios.get("/purchase-orders/history", {
    params: filteredParams,
  });
  return data;
};
export const getTopPurchasedProducts = async (
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

  const { data } = await axios.get("/purchase-orders/top-products", { params });
  return data;
};

export const getPurchasePriceTrend = async (
  productId: string
): Promise<{ month: string; unitCost: number }[]> => {
  const { data } = await axios.get(`/purchase-orders/price-trend/${productId}`);
  return data;
};
export const getMonthlyPurchaseQuantityTrend = async (
  productId: string
): Promise<{ period: string; totalQuantity: number }[]> => {
  const { data } = await axios.get(
    `/purchase-orders/monthly-quantity-trend/${productId}`
  );
  return data;
};

export const getPurchasedProducts = async (): Promise<ProductI[]> => {
  const { data } = await axios.get("/purchase-orders/purchased-products");
  return data;
};
