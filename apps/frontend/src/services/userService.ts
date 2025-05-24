// services/userService.ts
import axiosInstance from "@/lib/axiosInstance";

export async function fetchCurrentUser() {
  try {
    const response = await axiosInstance.get("/auth/perfil");
    return response.data;
  } catch (error: any) {
    if (error.response?.status !== 401) {
      console.error("Error al obtener el usuario:", error);
    }
  }
}
