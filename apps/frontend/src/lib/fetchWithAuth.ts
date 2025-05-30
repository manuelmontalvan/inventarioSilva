export const fetchWithAuth = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include', // importantísimo para enviar cookies
  });

  if (res.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  return res.json(); // o res.text() si aplica
};
