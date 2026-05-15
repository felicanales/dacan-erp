import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { Prisma } from "@prisma/client";
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

const carpetaUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  icono: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const carpeta = await prisma.carpetaPagina.findUnique({
    where: { id },
    include: { _count: { select: { paginas: true } } },
  });
  if (!carpeta) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(carpeta);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = carpetaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const carpeta = await prisma.carpetaPagina.update({
    where: { id },
    data: {
      ...(parsed.data.nombre !== undefined && { nombre: parsed.data.nombre }),
      ...("icono" in parsed.data && { icono: parsed.data.icono ?? null }),
    },
    include: { _count: { select: { paginas: true } } },
  });

  return NextResponse.json(carpeta);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.$transaction([
      prisma.pagina.updateMany({
        where: { carpetaId: id },
        data: { carpetaId: null },
      }),
      prisma.carpetaPagina.delete({ where: { id } }),
    ]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}
