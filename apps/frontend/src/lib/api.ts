// lib/api.ts
import { UserI } from "@/types/user";

export const getUsers = async (): Promise<UserI[]> => {
  const token = localStorage.getItem("token");

  if (!token) throw new Error("No se encontró el token");

  const res = await fetch("http://localhost:3001/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

   if (!res.ok) {
    if (res.status === 403) {
      throw new Error("No tienes permisos de administrador.");
    } else if (res.status === 401) {
      throw new Error("No estás autenticado.");
    } else {
      const body = await res.text();
      throw new Error(`Error ${res.status}: ${body}`);
    }
  }

const data = await res.json();
  console.log("Respuesta del backend:", data);

  // ⚠️ Verifica si los datos están en `data.users` o en `data` directamente
  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data.users)) {
    return data.users;
  } else {
    throw new Error("Formato inesperado en la respuesta del servidor");
  }
};