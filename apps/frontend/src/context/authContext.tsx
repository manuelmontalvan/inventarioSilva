"use client";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import axiosInstance, { setSessionExpiredHandler } from "@/lib/axiosInstance";
import { setIsLoggingOut } from "@/lib/axiosInstance";
interface User {
  id: number;
  name: string; 
  lastname: string;
  email: string;
  role: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setSessionExpired: (expired: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axiosInstance.get("/auth/perfil");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false); // <- Esto asegura que el spinner termine
      }
    };

    checkSession();

    // Establece el handler para manejar sesión expirada
    setSessionExpiredHandler(() => {
      setSessionExpired(true);
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // 1. Enviar login
      await axiosInstance.post("/auth/login", { email, password });

      // 2. Obtener perfil del usuario autenticado
      const res = await axiosInstance.get("/auth/perfil");
      const user = res.data;

      setUser(user); // Guarda objeto tipo User en el estado
    } catch (error: any) {
      setUser(null);
      throw new Error(
        error?.response?.data?.message || "Error al iniciar sesión"
      );
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await axiosInstance.post("/auth/logout"); // con credentials y cookies
    } catch (e) {
      console.warn("Error cerrando sesión:", e);
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      setTimeout(() => {
        router.push("/login");
      }, 100); // pequeño delay
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, setSessionExpired }}
    >
      {children}
      {sessionExpired && (
        <SessionExpiredModal
          onClose={() => {
            setSessionExpired(false);
            logout();
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
