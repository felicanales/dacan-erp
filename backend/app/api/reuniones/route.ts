import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import { ensureTeamUsers } from "@/src/lib/team-users";

const reunionSchema = z.object({
  titulo: z.string().min(3),
  fecha: z.string().datetime({ offset: true }),
  duracionMinutos: z.number().int().positive().optional().nullable(),
  tipo: z.enum(["interna", "con_proveedor", "con_cliente"]).default("interna"),
  estado: z.enum(["programada", "completada", "cancelada"]).default("programada"),
  linkVideoCall: z.string().url().optional().nullable().or(z.literal("")),
  agenda: z.string().optional().nullable(),
  notasIa: z.string().optional().nullable(),
  participantes: z.array(z.string()).min(1),
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

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await ensureTeamUsers(prisma);

  const reuniones = await prisma.reunion.findMany({
    orderBy: { fecha: "desc" },
    include: reunionInclude,
  });

  return NextResponse.json(reuniones);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await ensureTeamUsers(prisma);

  const body = await req.json();
  const parsed = reunionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const participantes = [...new Set(data.participantes)];
  const participantesValidos = await validateParticipantes(participantes);
  if (!participantesValidos) {
    return NextResponse.json(
      { error: "Participantes invalidos" },
      { status: 400 }
    );
  }

  const reunion = await prisma.reunion.create({
    data: {
      titulo: data.titulo,
      fecha: new Date(data.fecha),
      duracionMinutos: data.duracionMinutos ?? null,
      tipo: data.tipo,
      estado: data.estado,
      linkVideoCall: data.linkVideoCall || null,
      agenda: data.agenda ?? null,
      notasIa: data.notasIa ?? null,
      participantes: {
        create: participantes.map((usuarioId) => ({ usuarioId })),
      },
    },
    include: reunionInclude,
  });

  return NextResponse.json(reunion, { status: 201 });
}
