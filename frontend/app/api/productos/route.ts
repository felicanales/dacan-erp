import { NextRequest } from "next/server";
import { proxyToBackend } from "@/app/api/proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend("/api/productos", request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend("/api/productos", request);
}
