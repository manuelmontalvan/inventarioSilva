import axios from "@/lib/axiosInstance";

export interface Brand {
  id: string;
  name: string;
}

export const getBrands = async (): Promise<Brand[]> => {
  const res = await axios.get("/brands", { withCredentials: true });
  return res.data;
};

export const createBrand = async (brand: { name: string }): Promise<Brand> => {
  const res = await axios.post("/brands", brand, { withCredentials: true });
  return res.data;
};

export const updateBrand = async (id: string, brand: { name: string }): Promise<Brand> => {
  const res = await axios.put(`/brands/${id}`, brand, { withCredentials: true });
  return res.data;
};

export const deleteBrand = async (id: string): Promise<null> => {
  const res = await axios.delete(`/brands/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};
