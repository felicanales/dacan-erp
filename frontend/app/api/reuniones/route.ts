import { NextRequest } from "next/server";
import { proxyToBackend } from "../proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend("/api/reuniones", request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend("/api/reuniones", request);
}
