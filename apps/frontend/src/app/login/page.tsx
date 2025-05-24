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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;
