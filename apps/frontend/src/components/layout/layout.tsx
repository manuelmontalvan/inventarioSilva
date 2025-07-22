// ===============================
// Layout Component
// ===============================
import Header from "./header";
import Footer from "./footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./appSidebar";

import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

    
        <main className="flex-1 overflow-auto dark:bg-gray-800">{children}</main>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
