import axios from "axios";

// 👉 URL base desde .env o localhost por defecto
const baseURL =
  process.env.NEXT_PUBLIC_API_NEST || "http://localhost:3001/api";

// 👉 Instancia principal de Axios
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// 👉 Agregar o remover token manualmente
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

// 👉 Manejadores de sesión expirada
let onSessionExpired: (() => void) | null = null;
let isLoggingOut = false;
let modalShown = false;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
  if (!value) modalShown = false;
};

// 👉 Interceptor global para manejar errores 401 y reintentar con token renovado
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const ignoredPaths = ["/auth/login", "/auth/refresh"];
    const isIgnored = ignoredPaths.some((path) =>
      originalRequest?.url?.includes(path)
    );
    if (isIgnored) return Promise.reject(error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoggingOut &&
      !modalShown
    ) {
      originalRequest._retry = true;

      try {
        // ✅ Usa la instancia configurada (misma baseURL + cookies)
        const refreshResponse = await axiosInstance.post("/auth/refresh");

        const { access_token } = refreshResponse.data;

        // 🔐 Reintenta original con nuevo token
        setAuthToken(access_token);
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        modalShown = true;
        console.warn("🔐 Sesión expirada y refresh fallido:", originalRequest?.url);
        if (onSessionExpired) onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
