"use client";

import {
  Warehouse,
  LayoutDashboard,
  Settings,
ShieldUser,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  UserCog,
  Hammer,
  Layers,
  Scale,
  Tag,
  PackagePlus,
  Repeat,
  LineChart,
  MapPin,
  ShoppingCart,
  Handshake,
  Receipt,
  Store,
  FilePlus,
  History,
  ContactRound,
  TrendingUp,
  Layers2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
  hasChildren?: boolean;
  children?: SidebarItem[];
}

const items: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Gestión de usuarios",
    url: "#",
    icon: UserCog,
    hasChildren: true,
    children: [
      {
        title: "Usuario",
        url: "/users",
        icon: ShieldUser,
      },
      {
        title: "Rol",
        url: "/roles",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: " Gestion de Productos",
    url: "#",
    icon: Warehouse,
    hasChildren: true,
    children: [
      {
        title: "Products",
        url: "/products",
        icon: Hammer,
      },
      {
        title: "Marca",
        url: "/products/brand",
        icon: Tag,
      },
      {
        title: "Categoria",
        url: "/products/categories",
        icon: Layers,
      },
      {
        title: "Unidad de medida ",
        url: "/products/unitOfMeasure",
        icon: Scale,
      },
      {
        title: "Localidades",
        url: "/products/localities",
        icon: MapPin,
      },
       {
        title: "ProductStock",
        url: "/products/stock",
        icon: Layers2,
      },
    ],
  },
   {
    title: "Gestion de compras",
    url: "#",
    icon: ShoppingCart,
    hasChildren: true,
    children: [
      {
        title: "Registro de compras",
        url: "/purchases",
        icon: Receipt,
      },
      {
        title: "Proveedores",
        url: "/purchases/suppliers",
        icon: Handshake,
      },
      {
        title: "Historial de Compras",
        url: "/purchases/history",
        icon: History,
      },
    ],
  },
    {
    title: "Gestion de Ventas ",
    url: "#",
    icon: Store,
    hasChildren: true,
    children: [
      {
        title: "Registro de ventas",
        url: "/purchases",
        icon: FilePlus,
      },
      {
        title: "Historial de ventas",
        url: "/purchases/suppliers",
        icon: History,
      },
       {
        title: "Clientes",
        url: "/sales/customers",
        icon: ContactRound,
      },
    ],
  },
  {
    title: "Gestion Bodega",
    url: "#",
    icon: Repeat,
    hasChildren: true,
    children: [
      {
        title: "Entrada y Salida  de productos",
        url: "/inventory",
        icon: PackagePlus,
      },
    
    ],
  },
  {
    title: "Configuracion",
    url: "#",
    icon: Settings,
    hasChildren: true,
    children: [
      {
        title: "Margen e impuesto",
        url: "/config/margins-and-taxes",
        icon:TrendingUp,
      },
    
    ],
  },
  {
    title: "Analisis Predictivo",
    url: "/analytics",
    icon: LineChart,
  },
];

export function AppSidebar() {
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Link href="/login">
            <SidebarGroupLabel className="cursor-pointer text-lg font-semibold text-purple-600 dark:text-purple-400 px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-950 shadow-sm tracking-wide uppercase hover:bg-purple-200 dark:hover:bg-purple-900 transition">
              Ferretería Silva
            </SidebarGroupLabel>
          </Link>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isOpen = openMenus.includes(item.title);

                return (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      {item.hasChildren && item.children?.length ? (
                        <div
                          onClick={() => toggleMenu(item.title)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md no-underline text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-0 cursor-pointer w-full"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                          {isOpen ? (
                            <ChevronDown className="ml-auto w-4 h-4" />
                          ) : (
                            <ChevronRight className="ml-auto w-4 h-4" />
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.url}
                          className="flex items-center gap-2 px-3 py-2 rounded-md no-underline text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuItem>

                    {/* Submenú */}
                    {isOpen && item.children?.length && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.title}
                            href={child.url}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            <child.icon className="w-4 h-4" />
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
