import axios from "@/lib/axiosInstance";

export interface Supplier {
  id: string;
  identification: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await axios.get("/suppliers", { withCredentials: true });
  return res.data;
};

export const createSupplier = async (supplier: Omit<Supplier, "id">): Promise<Supplier> => {
  const res = await axios.post("/suppliers", supplier, { withCredentials: true });
  return res.data;
};

export const updateSupplier = async (id: string, supplier: Omit<Supplier, "id">): Promise<Supplier> => {
  const res = await axios.patch(`/suppliers/${id}`, supplier, { withCredentials: true });
  return res.data;
};

export const deleteSupplier = async (id: string): Promise<null> => {
  const res = await axios.delete(`/suppliers/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};
