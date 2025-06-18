// app/providers.tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import {ThemeProvider as NextThemesProvider} from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider
        toastProps={{
          radius: "full",      
          variant: "bordered",
          timeout: 5000,          
          
        }}
      />
      {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
