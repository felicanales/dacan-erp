import { NextRequest } from "next/server";
import { proxyToBackend } from "../proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend("/api/usuarios", request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend("/api/usuarios", request);
}
