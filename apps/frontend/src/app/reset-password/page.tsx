"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addToast } from "@heroui/toast";

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function strengthLabel(score: number) {
  switch (score) {
    case 0:
    case 1:
      return { label: "Débil", color: "text-red-600" };
    case 2:
    case 3:
      return { label: "Media", color: "text-yellow-600" };
    case 4:
      return { label: "Fuerte", color: "text-green-600" };
    default:
      return { label: "", color: "" };
  }
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMismatch =
    newPassword !== confirmPassword && confirmPassword.length > 0;

  const strength = passwordStrength(newPassword);
  const { label, color } = strengthLabel(strength);

  // Protección: si no hay token, redirigir
  useEffect(() => {
    if (!token) {
      addToast({ color: "danger", title: "Token no proporcionado" });
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      addToast({ color: "danger", title: "Token inválido o ausente" });
      return;
    }

    if (passwordsMismatch) {
      addToast({ color: "danger", title: "Las contraseñas no coinciden" });
      return;
    }

    if (strength < 3) {
      addToast({ color: "warning", title: "La contraseña es débil" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast({ color: "danger", title: data.message || "Error desconocido" });
        setIsLoading(false);
        return;
      }

      addToast({ color: "success", title: "Contraseña actualizada correctamente" });
      router.push("/login");
    } catch (error) {
      addToast({ color: "danger", title: "Error de conexión" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20 bg-white rounded shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Restablecer contraseña</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
        />
        {newPassword && (
          <p className={`text-sm font-semibold ${color}`}>
            Seguridad: {label}
          </p>
        )}
        <Input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
        />
        {passwordsMismatch && (
          <p className="text-red-500 text-sm">Las contraseñas no coinciden</p>
        )}
        <Button
          type="submit"
          disabled={isLoading || passwordsMismatch}
          className="w-full"
        >
          {isLoading ? "Actualizando..." : "Actualizar contraseña"}
        </Button>
      </form>
    </div>
  );
}
