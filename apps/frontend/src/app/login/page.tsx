"use client";
import React from "react";
import LoginForm from "@/components/login/loginForm";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";



const LoginPage = () => {
  const router = useRouter();

  const handleLogin = (email: string) => { 
      addToast({
    color: "success",
    title: "Usuario Inició Sesión",    
    description: `Bienvenido, ${email}`, // aquí pones el email
  });
    
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-300 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
       <LoginForm onLogin={handleLogin} />

      </div>
    </div>
  );
};

export default LoginPage;
