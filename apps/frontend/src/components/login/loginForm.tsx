"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      if (!email || !password) throw new Error("Por favor, completa todos los campos.");

      await login(email, password);
      onLogin(email);
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
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto px-6 py-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-zinc-800 dark:text-white">Iniciar Sesión</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bienvenido de nuevo, ingresa tus credenciales
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-zinc-800 dark:text-white">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="mt-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white border-gray-300 dark:border-zinc-600"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-zinc-800 dark:text-white">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="mt-1 pr-10 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white border-gray-300 dark:border-zinc-600"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar Sesión <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                ¿Olvidaste tu contraseña?
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-zinc-800 dark:text-white">Recuperar contraseña</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white border-gray-300 dark:border-zinc-600"
                />
                <DialogFooter>
                  <Button onClick={handlePasswordRecovery}>Enviar</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
