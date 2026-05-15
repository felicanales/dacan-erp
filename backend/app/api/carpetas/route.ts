import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
  } catch {
    return null;
  }
}

const carpetaSchema = z.object({
  nombre: z.string().min(1),
  icono: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const carpetas = await prisma.carpetaPagina.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { paginas: true } } },
  });

  return NextResponse.json(carpetas);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = carpetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const carpeta = await prisma.carpetaPagina.create({
    data: {
      nombre: parsed.data.nombre,
      icono: parsed.data.icono ?? null,
    },
    include: { _count: { select: { paginas: true } } },
  });

  return NextResponse.json(carpeta, { status: 201 });
}
