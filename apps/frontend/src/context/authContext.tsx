"use client";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import SessionExpiredModal from "@/components/SessionExpiredModal"; // Asegúrate de importar tu modal correctamente
import axiosInstance from "@/lib/axiosInstance";
import { setSessionExpiredHandler, setAuthToken } from "@/lib/axiosInstance";
interface AuthContextType {
  user: string | null;
  token: string | null;
  login: (user: string, token: string) => void;
  logout: () => void;
  loading: boolean;
  setSessionExpired: (expired: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      setAuthToken(savedToken); // Inyectar token a Axios
    }

    // Configurar handler para sesión expirada (solo una vez al iniciar)
    setSessionExpiredHandler(() => {
      setSessionExpired(true);
     
    });

    setLoading(false); // Ya terminó de verificar sesión
  }, []); // 👈 solo se ejecuta al montar


  const login = (user: string, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", user);
    setAuthToken(token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, setSessionExpired }}
    >
      {children}
      {sessionExpired && (
        <SessionExpiredModal
          onClose={() => {
            setSessionExpired(false);
            logout();
            router.push("/login");
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
