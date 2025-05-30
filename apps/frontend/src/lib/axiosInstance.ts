import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true, // 🔑 Siempre enviar cookies
});

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
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      onSessionExpired &&
      !isLoggingOut &&
       !modalShown // 👈 Aquí está la condición importante
    ) {
       modalShown = true;
         console.warn("🔐 Sesión expirada por:", error.config.url);
      onSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
