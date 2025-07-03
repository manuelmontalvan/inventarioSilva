import axiosInstance from "@/lib/axiosInstance";
import { UserI } from "@/types/user";
import { Role } from "@/types/role";

// USERS
export const getUsers = async (): Promise<UserI[]> => {
  try {
    const { data } = await axiosInstance.get("/users");
    console.log("Respuesta del backend (usuarios):", data);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.users)) return data.users;

    throw new Error("Formato inesperado en la respuesta del servidor");
  } catch (error: any) {
    if (error.response?.status === 403) throw new Error("No tienes permisos de administrador.");
    if (error.response?.status === 401) throw new Error("No estás autenticado.");
    throw new Error(error.message || "Error al obtener usuarios");
  }
};

// ROLES
export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data } = await axiosInstance.get("/roles");

    // Suponiendo que la API responde con { data: [...] }
    if (Array.isArray(data.data)) return data.data;

    throw new Error("Formato inesperado en la respuesta de roles");
  } catch (error: any) {
    throw new Error(error.message || "Error al obtener roles");
  }
};

export const createRole = async (name: string, pageIds: string[]): Promise<Role> => {
  try {
    const { data } = await axiosInstance.post("/roles", { name, pageIds });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Error al crear rol: ${error.message}`);
  }
};

export const updateRole = async (
  id: string,
  name: string,
  pageIds: string[]
): Promise<Role> => {
  try {
    const { data } = await axiosInstance.put(`/roles/${id}`, { name, pageIds });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Error al actualizar rol: ${error.message}`);
  }
};

export const deleteRole = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/roles/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Error al eliminar rol: ${error.message}`);
  }
};
