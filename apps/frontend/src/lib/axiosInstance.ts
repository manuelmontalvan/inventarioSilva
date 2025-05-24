import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api",
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

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

// Interceptor de respuesta global
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && onSessionExpired) {
      onSessionExpired(); // Activa el modal desde fuera
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
