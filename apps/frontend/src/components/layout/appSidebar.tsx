import { Warehouse, LayoutDashboard, Settings, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
  hasChildren?: boolean;
}

// Menu items.
const items:SidebarItem[] = [
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
    hasChildren: true,
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
              Ferretería Silva
            </SidebarGroupLabel>
          </Link>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 px-3 py-2 rounded-md no-underline text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-0"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                     {item.hasChildren && <ChevronDown className="ml-auto w-4 h-4" />}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
