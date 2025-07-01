import axios from "@/lib/axiosInstance";
import { Page } from "@/types/page";



// Obtener todas las páginas
export const getPages = async (): Promise<Page[]> => {
  const res = await axios.get("/pages", { withCredentials: true });
  return res.data;
};

// Crear una nueva página
export const createPage = async (page: { name: string; path: string }): Promise<Page> => {
  const res = await axios.post("/pages", page, { withCredentials: true });
  return res.data;
};

// Actualizar una página existente
export const updatePage = async (id: string, page: { name: string; path: string }): Promise<Page> => {
  const res = await axios.put(`/pages/${id}`, page, { withCredentials: true });
  return res.data;
};

// Eliminar una página
export const deletePage = async (id: string): Promise<void> => {
  await axios.delete(`/pages/${id}`, { withCredentials: true });
};
