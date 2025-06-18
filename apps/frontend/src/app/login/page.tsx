"use client";
import React from "react";
import LoginForm from "@/components/form/loginForm";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();

  const handleLogin = (email: string) => {
    alert(`¡Bienvenido! Usuario autenticado con email: ${email}`);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-300 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bienvenido de nuevo, ingresa tus credenciales
          </p>
        </div>
        <LoginForm onLogin={handleLogin} />
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          ¿No tienes una cuenta? <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Regístrate</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
