import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import { ensureTeamUsers } from "@/src/lib/team-users";

const usuarioSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  timezone: z.string().min(1).default("America/Santiago"),
});

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await ensureTeamUsers(prisma);

  const usuarios = await prisma.usuario.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      email: true,
      timezone: true,
      rol: true,
    },
  });

  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = usuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.usuario.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    if (!existing.activo) {
      const restored = await prisma.usuario.update({
        where: { id: existing.id },
        data: {
          nombre: parsed.data.nombre,
          timezone: parsed.data.timezone,
          activo: true,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          timezone: true,
          rol: true,
        },
      });

      return NextResponse.json(restored, { status: 200 });
    }

    return NextResponse.json(
      { error: "Ya existe un participante con ese correo" },
      { status: 409 }
    );
  }

  const usuario = await prisma.usuario.create({
    data: {
      clerkId: `manual-${randomUUID()}`,
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      timezone: parsed.data.timezone,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      timezone: true,
      rol: true,
    },
  });

  return NextResponse.json(usuario, { status: 201 });
}
