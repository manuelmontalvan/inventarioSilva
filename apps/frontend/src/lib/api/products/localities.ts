import axios from "@/lib/axiosInstance";

export interface Category {
  id: string;
  name: string;
}

export interface Locality {
  id: string;
  name: string;
  category: Category;
}

export const getLocalities = async (): Promise<Locality[]> => {
  const res = await axios.get("/localities", { withCredentials: true });
  return res.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get("/categories", { withCredentials: true });
  return res.data;
};

export const createLocality = async (locality: { name: string; categoryId: string }): Promise<Locality> => {
  const res = await axios.post("/localities", locality, { withCredentials: true });
  return res.data;
};

export const updateLocality = async (
  id: string,
  locality: { name: string; categoryId: string }
): Promise<Locality> => {
  const res = await axios.patch(`/localities/${id}`, locality, { withCredentials: true });
  return res.data;
};


export const deleteLocality = async (id: string): Promise<null> => {
  const res = await axios.delete(`/localities/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};
