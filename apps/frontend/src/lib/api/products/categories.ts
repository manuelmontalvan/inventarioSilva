import axios from "@/lib/axiosInstance";

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get("/categories", { withCredentials: true });
  return res.data;
};

export const createCategory = async (category: { name: string; description?: string }): Promise<Category> => {
  const res = await axios.post("/categories", category, { withCredentials: true });
  return res.data;
};

export const updateCategory = async (id: string, category: { name: string; description?: string }): Promise<Category> => {
  const res = await axios.put(`/categories/${id}`, category, { withCredentials: true });
  return res.data;
};

export const deleteCategory = async (id: string): Promise<null> => {
  const res = await axios.delete(`/categories/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};
