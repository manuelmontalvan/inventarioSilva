// lib/api.ts
import { UserI } from "@/types/user";
import { Role } from "@/types/role"; // Asegúrate de tener esta interfaz definida

export const getUsers = async (): Promise<UserI[]> => {
  const res = await fetch("http://localhost:3001/api/users", {
    credentials: "include",
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
  console.log("Respuesta del backend (usuarios):", data);

  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data.users)) {
    return data.users;
  } else {
    throw new Error("Formato inesperado en la respuesta del servidor");
  }
};

export const getRoles = async (): Promise<Role[]> => {
  const res = await fetch("http://localhost:3001/api/roles", {
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("No tienes permisos para ver los roles.");
    } else if (res.status === 401) {
      throw new Error("No estás autenticado.");
    } else {
      const body = await res.text();
      throw new Error(`Error ${res.status}: ${body}`);
    }
  }

  const data = await res.json();
  console.log("Respuesta del backend (roles):", data);

  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data.roles)) {
    return data.roles;
  } else {
    throw new Error("Formato inesperado en la respuesta del servidor");
  }
};
