"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onLogin: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error("Por favor, completa todos los campos.");
      }

      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Credenciales incorrectas");
      }

      const data = await response.json();
      const token = data.access_token;
      login(email, token); 
      localStorage.setItem("token", token);
      
         router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false); // Asegúrate de que esto se ejecute SIEMPRE, después de la resolución de la promesa
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/10"
    >
      <h2 className="text-2xl font-semibold text-center text-white mb-8">
        Iniciar Sesión
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu email"
            className="bg-black/20 text-white border-purple-500/30 placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-white">
            Contraseña
          </Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            className="bg-black/20 text-white border-purple-500/30 placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <Button
          type="submit"
          className={cn(
            "w-full bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-300",
            "flex items-center justify-center gap-2 py-3"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </form>
      
    </motion.div>
  );
};

export default LoginForm;