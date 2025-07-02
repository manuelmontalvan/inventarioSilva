// lib/api/products.ts
import axios from "@/lib/axiosInstance"; // Asegúrate que tienes esto configurado
import { ProductI } from "@/types/product";
interface ProductFilters {
  categoryIds?: string[];
  page?: number;
  limit?: number;
  search?: string;
}

export const getProducts = async (
  filters?: ProductFilters
): Promise<{
  data: ProductI[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const res = await axios.get("http://localhost:3001/api/products", {
    params: {
      categoryIds:
        filters?.categoryIds && filters.categoryIds.length > 0
          ? filters.categoryIds.join(",")
          : undefined,

      page: filters?.page ?? 1,
      limit: filters?.limit ?? 10,
      search: filters?.search ?? undefined,
    },
    withCredentials: true,
  });

  return res.data;
};

export const createProduct = async (product: Partial<ProductI>) => {
  const res = await axios.post("/products", product);
  return res.data;
};

export const updateProduct = async (id: string, product: Partial<ProductI>) => {
  const res = await axios.patch(
    `http://localhost:3001/api/products/${id}`, // Asegúrate de incluir el dominio completo
    product,
    {
      withCredentials: true, // importante si usas cookies
    }
  );
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await axios.delete(`/products/${id}`);
  return res.status === 204 ? null : res.data;
};

export const deleteAllProducts = async () => {
  const res = await axios.delete(`/products`);
  return res.status === 204 ? null : res.data;
};

export const uploadProducts = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("/products/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
