// app/layout.tsx
import { Providers } from "./provider";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
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
