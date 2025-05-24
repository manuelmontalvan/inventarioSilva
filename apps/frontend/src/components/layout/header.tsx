// ===============================
// Header Component
// ===============================

import React, { useState, useEffect, useRef } from "react";
import { fetchCurrentUser } from '@/services/userService';

import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await fetchCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    getUser();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirigir al login
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4">
      {/* Barra de Búsqueda (Ejemplo) */}
      <div className="flex-grow max-w-md">
        <Input type="search" placeholder="Buscar..." className="w-full" />
      </div>
      {/* Dropdown de Usuario */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "rounded-md p-1"
              )}
              ref={avatarRef}
            >
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.name}`}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                  
                  <h1>HOLA</h1>
                  {user.name}
                </span>
              
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};
export default Header;
