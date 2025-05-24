// services/userService.ts
import { getToken } from "@/lib/auth";

export async function fetchCurrentUser() {
  const token = getToken();
  const res = await fetch('http://localhost:3001/api/auth/perfil', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("No se pudo obtener el usuario");
  return res.json();
}
