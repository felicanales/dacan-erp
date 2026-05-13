import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001";

export async function proxyToBackend(path: string, request: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = ["GET", "DELETE"].includes(request.method)
    ? undefined
    : await request.text();

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
