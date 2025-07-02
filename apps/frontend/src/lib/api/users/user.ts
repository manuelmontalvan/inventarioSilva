// lib/api.ts
import { UserI } from "@/types/user";

const BASE_URL = process.env.NEXT_PUBLIC_API_NEST || "http://localhost:3001/api";

export const getUsers = async (): Promise<UserI[]> => {
  const res = await fetch(`${BASE_URL}/users`, {
    credentials: "include", // para enviar cookies
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

  // Retorna el array de usuarios según formato recibido
  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data.users)) {
    return data.users;
  } else {
    throw new Error("Formato inesperado en la respuesta del servidor");
  }
};
