import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import {
  CATEGORIAS_FINANZAS,
  ESTADOS_SUSCRIPCION,
  normalizeEnumParam,
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

const suscripcionSchema = z.object({
  nombre: z.string().min(2),
  categoria: categoriaSchema.optional(),
  estado: estadoSuscripcionSchema.default("activa"),
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

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const estado = normalizeEnumParam(
    req.nextUrl.searchParams.get("estado"),
    ESTADOS_SUSCRIPCION
  );

  const suscripciones = await prisma.suscripcion.findMany({
    where: estado ? { estado } : undefined,
    orderBy: [{ fechaRenovacion: "asc" }, { nombre: "asc" }],
    include: suscripcionInclude,
  });

  return NextResponse.json(suscripciones);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = suscripcionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const fechaAdquisicion = parseDate(data.fechaAdquisicion);
  const fechaRenovacion = parseDate(data.fechaRenovacion);

  if (fechaAdquisicion === undefined || fechaRenovacion === undefined) {
    return NextResponse.json({ error: "Fecha de suscripcion invalida" }, { status: 400 });
  }

  const suscripcion = await prisma.suscripcion.create({
    data: {
      nombre: data.nombre.trim(),
      categoria: data.categoria ?? null,
      estado: data.estado,
      fechaAdquisicion,
      fechaRenovacion,
    },
    include: suscripcionInclude,
  });

  return NextResponse.json(suscripcion, { status: 201 });
}
