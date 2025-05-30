import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/recuperar", "/"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");

  const isPublic = PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Aplica a todas las rutas excepto API y estáticos
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
