import { Warehouse, LayoutDashboard, Settings, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";

import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Inventario",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    url: "/dashboard/users",
    icon: User,
 
  },
  {
    title: "Productos",
    url: "#",
    icon: Warehouse,
  },

  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Link href="/login">
            <SidebarGroupLabel className="cursor-pointer text-lg font-semibold text-purple-600 dark:text-purple-400 px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-950 shadow-sm tracking-wide uppercase hover:bg-purple-200 dark:hover:bg-purple-900 transition">
              Ferreteria Silva
            </SidebarGroupLabel>
          </Link>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                         <ChevronDown className="ml-auto" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
