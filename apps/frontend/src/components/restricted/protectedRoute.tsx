"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import AccessDenied from "@/components/restricted/accessDenied";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Inicializar en null para saber si ya se evaluó
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) {
      setAuthorized(null); // Mientras carga, no decidimos aún
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role?.name === "admin") {
      setAuthorized(true);
      return;
    }

    const allowedPaths = user.role?.pages?.map((p: any) => p.path) || [];

    const isAllowed = allowedPaths.some(
      (path: string) => pathname === path || pathname.startsWith(path + "/")
    );

    setAuthorized(isAllowed);
  }, [loading, user, pathname, router]);

  if (loading || authorized === null) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  if (!authorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
