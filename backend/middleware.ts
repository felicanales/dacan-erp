import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";

export async function middleware(request: NextRequest) {
  // Permitir health check sin auth
  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export const config = {
  matcher: "/api/:path*",
};
