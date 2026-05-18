import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import {
  CATEGORIAS_FINANZAS,
  ESTADOS_SUSCRIPCION,
} from "@/src/lib/finanzas/enums";

const categoriaSchema = z.preprocess(
  (value) => {
    if (value === "") return null;
    return typeof value === "string" ? value.toLowerCase() : value;
  },
  z.enum(CATEGORIAS_FINANZAS).nullable()
);

const estadoSuscripcionSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toLowerCase() : value),
  z.enum(ESTADOS_SUSCRIPCION)
);

const updateSchema = z.object({
  nombre: z.string().min(2).optional(),
  categoria: categoriaSchema.optional(),
  estado: estadoSuscripcionSchema.optional(),
  fechaAdquisicion: z.string().optional().nullable(),
  fechaRenovacion: z.string().optional().nullable(),
});

function parseDate(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return null;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? new Date(`${normalized}T00:00:00.000Z`)
    : new Date(normalized);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

const suscripcionInclude = {
  pagos: {
    orderBy: { fechaPago: "desc" },
    take: 5,
    select: {
      id: true,
      nombre: true,
      estadoPago: true,
      fechaPago: true,
      montoPagadoNum: true,
    },
  },
  _count: { select: { pagos: true } },
} as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { id },
    include: suscripcionInclude,
  });

  if (!suscripcion) {
    return NextResponse.json({ error: "Suscripcion no encontrada" }, { status: 404 });
  }

  return NextResponse.json(suscripcion);
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

  const existing = await prisma.suscripcion.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Suscripcion no encontrada" }, { status: 404 });
  }

  const data = parsed.data;
  const fechaAdquisicion =
    data.fechaAdquisicion !== undefined ? parseDate(data.fechaAdquisicion) : undefined;
  const fechaRenovacion =
    data.fechaRenovacion !== undefined ? parseDate(data.fechaRenovacion) : undefined;

  if (
    (data.fechaAdquisicion !== undefined && fechaAdquisicion === undefined) ||
    (data.fechaRenovacion !== undefined && fechaRenovacion === undefined)
  ) {
    return NextResponse.json({ error: "Fecha de suscripcion invalida" }, { status: 400 });
  }

  const suscripcion = await prisma.suscripcion.update({
    where: { id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre.trim() }),
      ...(data.categoria !== undefined && { categoria: data.categoria }),
      ...(data.estado !== undefined && { estado: data.estado }),
      ...(data.fechaAdquisicion !== undefined && { fechaAdquisicion }),
      ...(data.fechaRenovacion !== undefined && { fechaRenovacion }),
    },
    include: suscripcionInclude,
  });

  return NextResponse.json(suscripcion);
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
  const existing = await prisma.suscripcion.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Suscripcion no encontrada" }, { status: 404 });
  }

  await prisma.suscripcion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
