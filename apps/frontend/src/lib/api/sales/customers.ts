import axios from "@/lib/axiosInstance";

export interface Customer {
  id: string;
  name: string;
  lastname?: string;
  identification?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get("/customers", { withCredentials: true });
  return res.data;
};

export const createCustomer = async (
  supplier: Omit<Customer, "id">
): Promise<Customer> => {
  const res = await axios.post("/customers", supplier, {
    withCredentials: true,
  });
  return res.data;
};

export const updateCustomer = async (
  id: string,
  supplier: Omit<Customer, "id">
): Promise<Customer> => {
  const res = await axios.patch(`/customers/${id}`, supplier, {
    withCredentials: true,
  });
  return res.data;
};

export const deleteCustomer = async (id: string): Promise<null> => {
  const res = await axios.delete(`/customers/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};
