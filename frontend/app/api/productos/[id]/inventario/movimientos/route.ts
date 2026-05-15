import { NextRequest } from "next/server";
import { proxyToBackend } from "@/app/api/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/api/productos/${id}/inventario/movimientos`, request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/api/productos/${id}/inventario/movimientos`, request);
}
