"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addToast } from "@heroui/toast";

interface LoginFormProps {
  onLogin: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_NEST || "http://localhost:3001/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error("Por favor, completa todos los campos.");
      }

      await login(email, password);
      onLogin(email); // ✅ Notifica al padre
      router.push("/dashboard");      
    } catch (error: unknown) {
      let message = "Error al iniciar sesión. Inténtalo de nuevo.";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      setError(message);
      addToast({ color: "danger", title: "Error al Iniciar Sesión" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!recoveryEmail) return;
    try {
      await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      addToast({
        color: "success",
        title: "Correo de recuperación enviado.",
      });
      router.push("/login");
    } catch {
      addToast({
        color: "danger",
        title: "Error al enviar correo de recuperación.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/10"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-center dark:text-white mb-8">
          Iniciar Sesión
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bienvenido de nuevo, ingresa tus credenciales
        </p>
      </div>

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
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="bg-black/20 text-white border-purple-500/30 placeholder:text-gray-400 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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

        <div className="text-center mt-4 dark:text-white">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="link"
                className=" text-blue-600 text-sm underline"
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/90 backdrop-blur border border-gray-300">
              <DialogHeader>
                <DialogTitle>Recuperar contraseña</DialogTitle>
                <DialogDescription>
                  Ingresa tu correo y te enviaremos instrucciones para
                  restablecer tu contraseña.
                </DialogDescription>
              </DialogHeader>
              <Input
                type="email"
                placeholder="tuemail@ejemplo.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
              <DialogFooter>
                <Button onClick={handlePasswordRecovery}>Enviar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
