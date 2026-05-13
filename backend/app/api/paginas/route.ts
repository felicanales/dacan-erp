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

const paginaSchema = z.object({
  titulo: z.string().min(1).default("Sin título"),
  icono: z.string().nullable().optional(),
  contenido: z.unknown().optional(),
});

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const paginas = await prisma.pagina.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, titulo: true, icono: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(paginas);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = paginaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const pagina = await prisma.pagina.create({
    data: {
      titulo: parsed.data.titulo,
      icono: parsed.data.icono ?? null,
    },
  });

  return NextResponse.json(pagina, { status: 201 });
}
