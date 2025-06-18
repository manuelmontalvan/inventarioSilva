"use client";

import { useAuth } from "@/context/authContext";
import Layout from "@/components/layout/layout";
import Redirecting from "@/components/ui/redirecting";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!user) return <Redirecting />;

  return <Layout>{children}</Layout>;
}
