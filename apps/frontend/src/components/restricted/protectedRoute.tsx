"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import AccessDenied from "@/components/restricted/accessDenied";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.role.name === "admin") {
        setAuthorized(true);
        return;
      }

      const allowedPaths = user.role?.pages?.map((p: any) => p.path) || [];

      if (allowedPaths.includes(pathname)) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  if (!authorized) {
    return <AccessDenied  />; // Muestra mensaje en el layout actual sin redirigir
  }

  return <>{children}</>;
}
