import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001";

async function proxyToBackend(path: string, request: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = request.method === "GET" ? undefined : await request.text();
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/api/containers/${id}`, request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/api/containers/${id}`, request);
}
