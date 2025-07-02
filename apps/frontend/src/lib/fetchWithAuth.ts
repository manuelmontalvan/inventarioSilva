export const fetchWithAuth = async (url: string) => {
  let res = await fetch(url, {
    credentials: 'include',
  });

  if (res.status === 401) {
    // intenta refresh
    try {
      const refreshRes = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        // Reintenta la original
        res = await fetch(url, {
          credentials: 'include',
        });
      } else {
        throw new Error('TOKEN_EXPIRED');
      }
    } catch  {
      throw new Error('TOKEN_EXPIRED');
    }
  }

  return res.json();
};
