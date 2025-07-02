import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_NEST || "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
;

// Añadir token a todas las peticiones
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

// Handler externo para sesión expirada (lo asignas desde tu contexto)
let onSessionExpired: (() => void) | null = null;
let isLoggingOut = false;
let modalShown = false;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
  if (!value) {
    modalShown = false;
  }
};

// Interceptor de respuesta global
// Interceptor de respuesta global con intento de refresh
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // ⚠️ Evitar que el interceptor actúe sobre /auth/login y /auth/refresh
    const ignoredPaths = ["/auth/login", "/auth/refresh"];
    const isIgnored = ignoredPaths.some(path => originalRequest?.url?.includes(path));
    if (isIgnored) {
      return Promise.reject(error); // ignora
    }

    // Interceptar solo errores 401 una sola vez
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoggingOut &&
      !modalShown
    ) {
      originalRequest._retry = true;

      try {
        // Intenta refresh
        const refreshResponse = await axios.post(
          "auth/refresh",
          {},
          { withCredentials: true }
        );

        const { access_token } = refreshResponse.data;

        // Reintenta con nuevo token
        setAuthToken(access_token);
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        modalShown = true;
        console.warn("🔐 Sesión expirada y refresh fallido:", error.config?.url);
        if (onSessionExpired) onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
