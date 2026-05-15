import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";

const updateSchema = z.object({
  titulo: z.string().min(3).optional(),
  fecha: z.string().datetime({ offset: true }).optional(),
  estado: z.enum(["programada", "completada", "cancelada"]).optional(),
  linkVideoCall: z.string().url().optional().nullable().or(z.literal("")),
  notasIa: z.string().optional().nullable(),
  participantes: z.array(z.string()).min(1).optional(),
});

const reunionInclude = {
  participantes: {
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true,
          timezone: true,
          rol: true,
        },
      },
    },
    orderBy: { usuario: { nombre: "asc" } },
  },
} as const;

async function validateParticipantes(participantes: string[]) {
  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: participantes }, activo: true },
    select: { id: true },
  });

  return usuarios.length === new Set(participantes).size;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const reunion = await prisma.reunion.findUnique({
    where: { id },
    include: reunionInclude,
  });

  if (!reunion) {
    return NextResponse.json({ error: "Reunion no encontrada" }, { status: 404 });
  }

  return NextResponse.json(reunion);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.reunion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Reunion no encontrada" }, { status: 404 });
  }

  const data = parsed.data;
  const participantes = data.participantes
    ? [...new Set(data.participantes)]
    : undefined;

  if (participantes) {
    const participantesValidos = await validateParticipantes(participantes);
    if (!participantesValidos) {
      return NextResponse.json(
        { error: "Participantes invalidos" },
        { status: 400 }
      );
    }
  }

  const reunion = await prisma.$transaction(async (tx) => {
    await tx.reunion.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo }),
        ...(data.fecha !== undefined && { fecha: new Date(data.fecha) }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.linkVideoCall !== undefined && {
          linkVideoCall: data.linkVideoCall || null,
        }),
        ...(data.notasIa !== undefined && { notasIa: data.notasIa }),
      },
    });

    if (participantes) {
      await tx.reunionParticipante.deleteMany({ where: { reunionId: id } });
      await tx.reunionParticipante.createMany({
        data: participantes.map((usuarioId) => ({ reunionId: id, usuarioId })),
        skipDuplicates: true,
      });
    }

    return tx.reunion.findUnique({
      where: { id },
      include: reunionInclude,
    });
  });

  return NextResponse.json(reunion);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.reunion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Reunion no encontrada" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.reunionParticipante.deleteMany({ where: { reunionId: id } });
    await tx.reunion.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
