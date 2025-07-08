import axiosInstance from "@/lib/axiosInstance";
import { UserI } from "@/types/user";


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

export const createUser = async (user: Partial<UserI>): Promise<UserI> => {
  try {
    const { data } = await axiosInstance.post("/users", user);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Error al crear usuario: ${error.message}`);
  }
};

export const updateUser = async (id: string, user: Partial<UserI>): Promise<UserI> => {
  try {
    const { data } = await axiosInstance.patch(`/users/${id}`, user);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Error al actualizar usuario: ${error.message}`);
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/users/${id}`);
  } catch (error: any) {
    if (error.response?.status === 409) throw new Error("No puedes eliminar tu propia cuenta.");
    throw new Error(error.response?.data?.message || `Error al eliminar usuario: ${error.message}`);
  }
};