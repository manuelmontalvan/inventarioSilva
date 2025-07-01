import { UserI } from "@/types/user";
import { Role } from "@/types/role";


// USERS
export const getUsers = async (): Promise<UserI[]> => {
  const res = await fetch("http://localhost:3001/api/users", {
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 403) throw new Error("No tienes permisos de administrador.");
    if (res.status === 401) throw new Error("No estás autenticado.");
    const body = await res.text();
    throw new Error(`Error ${res.status}: ${body}`);
  }

  const data = await res.json();
  console.log("Respuesta del backend (usuarios):", data);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.users)) return data.users;
  throw new Error("Formato inesperado en la respuesta del servidor");
};


// ROLES
export const getRoles = async (): Promise<Role[]> => {
  const res = await fetch("http://localhost:3001/api/roles", {
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error ${res.status}: ${body}`);
  }

  const json = await res.json();

  // Asegúrate que tomas el array dentro de 'data'
  if (Array.isArray(json.data)) {
    return json.data;
  }

  throw new Error("Formato inesperado en la respuesta de roles");
};

export const createRole = async (name: string, pageIds: string[]): Promise<Role> => {
  const res = await fetch("http://localhost:3001/api/roles", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pageIds }),
  });

  if (!res.ok) throw new Error(`Error al crear rol: ${await res.text()}`);
  return await res.json();
};

export const updateRole = async (
  id: string,
  name: string,
  pageIds: string[]
): Promise<Role> => {
  const res = await fetch(`http://localhost:3001/api/roles/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pageIds }),
  });

  if (!res.ok) throw new Error(`Error al actualizar rol: ${await res.text()}`);
  return await res.json();
};

export const deleteRole = async (id: string): Promise<void> => {
  const res = await fetch(`http://localhost:3001/api/roles/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Error al eliminar rol: ${await res.text()}`);
};

