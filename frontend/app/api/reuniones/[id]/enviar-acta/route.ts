import { NextRequest } from "next/server";
import { proxyToBackend } from "../../../proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/api/reuniones/${id}/enviar-acta`, request);
}
