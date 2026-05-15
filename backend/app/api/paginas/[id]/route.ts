import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

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

const paginaUpdateSchema = z.object({
  nombre: z.string().nullable().optional(),
  titulo: z.string().min(1).optional(),
  icono: z.string().nullable().optional(),
  contenido: z.unknown().optional(),
  carpetaId: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const pagina = await prisma.pagina.findUnique({ where: { id } });
  if (!pagina) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(pagina);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = paginaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updateData: Prisma.PaginaUpdateInput = {};
  if ("nombre" in parsed.data) updateData.nombre = parsed.data.nombre ?? null;
  if (parsed.data.titulo !== undefined) updateData.titulo = parsed.data.titulo;
  if ("icono" in parsed.data) updateData.icono = parsed.data.icono ?? null;
  if (parsed.data.contenido !== undefined) {
    updateData.contenido = parsed.data.contenido as Prisma.InputJsonValue;
  }
  if ("carpetaId" in parsed.data) {
    updateData.carpeta = parsed.data.carpetaId
      ? { connect: { id: parsed.data.carpetaId } }
      : { disconnect: true };
  }

  const pagina = await prisma.pagina.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(pagina);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.pagina.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}
