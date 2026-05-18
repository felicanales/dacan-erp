import { NextRequest } from "next/server";
import { proxyToBackend } from "../../proxy";

function pathFromSegments(segments: string[]) {
  return `/api/finanzas/${segments.join("/")}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await params;
  return proxyToBackend(pathFromSegments(segments), request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await params;
  return proxyToBackend(pathFromSegments(segments), request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await params;
  return proxyToBackend(pathFromSegments(segments), request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await params;
  return proxyToBackend(pathFromSegments(segments), request);
}
