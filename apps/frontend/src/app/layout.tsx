// app/layout.tsx
import { Providers } from "./provider";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body >
        <AuthProvider>
          <Providers>
          {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
