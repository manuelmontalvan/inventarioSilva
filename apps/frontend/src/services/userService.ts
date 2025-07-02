// services/userService.ts
import axiosInstance from "@/lib/axiosInstance";

export async function fetchCurrentUser() {
  try {
    const response = await axiosInstance.get("/auth/perfil");
    return response.data;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as any).response?.status === "number"
    ) {
      if ((error as any).response.status !== 401) {
        console.error("Error al obtener el usuario:", error);
      }
    } else {
      console.error("Error desconocido al obtener el usuario:", error);
    }
  }
}
