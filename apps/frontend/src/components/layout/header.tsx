"use client";
import React, { useState, useEffect, useRef } from "react";
import { fetchCurrentUser } from "@/services/userService";
import { ChevronDown } from "lucide-react";
import { ThemeSwitcher } from "../ui/themeSwitcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { addToast } from "@heroui/toast";
import { useAuth } from "@/context/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const Header = () => {
  const [user, setUser ] = useState<{ name: string; email: string } | null>(
    null
  );
  const avatarRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await fetchCurrentUser();
        setUser(user);
        
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        addToast({
          title: "Usuario no encontrado",
          description: "No se pudo obtener el usuario",
          color: "warning",
        });
      }
    };

    getUser();
  }, []);



  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
             {/* Botón del Sidebar */}
        <SidebarTrigger className="text-blue-500" />

        {/* Icono de cambio de tema */}
        <ThemeSwitcher />
      </div>{" "}
 
      {/* Dropdown de usuario */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              ref={avatarRef}
              className={cn(
                "flex items-center gap-2 cursor-pointer rounded-md p-1",
                "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                  {user.name}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">           
           
             <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default Header;
