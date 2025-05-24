// lib/fetchWithAuth.ts
export const fetchWithAuth = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  return res.json(); // o res.text(), según lo que devuelva tu backend
};
