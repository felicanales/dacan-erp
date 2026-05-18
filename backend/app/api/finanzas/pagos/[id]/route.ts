import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import {
  CATEGORIAS_FINANZAS,
  DUENIOS_TARJETA,
  ESTADOS_PAGO,
  TIPOS_PAGO,
} from "@/src/lib/finanzas/enums";

const tipoPagoSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toLowerCase() : value),
  z.enum(TIPOS_PAGO)
);

const estadoPagoSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toLowerCase() : value),
  z.enum(ESTADOS_PAGO)
);

const categoriaSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toLowerCase() : value),
  z.enum(CATEGORIAS_FINANZAS)
);

const duenioTarjetaSchema = z.preprocess(
  (value) => {
    if (value === "") return null;
    return typeof value === "string" ? value.toLowerCase() : value;
  },
  z.enum(DUENIOS_TARJETA).nullable()
);

const updateSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  tipoPago: tipoPagoSchema.optional(),
  monto: z.string().optional().nullable(),
  montoPagadoNum: z.coerce.number().min(0).optional().nullable(),
  fechaPago: z.string().optional().nullable(),
  estadoPago: estadoPagoSchema.optional(),
  categorias: z.array(categoriaSchema).optional(),
  factura: z.string().optional().nullable(),
  tarjeta: z.string().optional().nullable(),
  duenioTarjeta: duenioTarjetaSchema.optional(),
  suscripcionId: z.string().optional().nullable(),
});

function emptyToNull(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseDate(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return null;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? new Date(`${normalized}T00:00:00.000Z`)
    : new Date(normalized);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function validateSuscripcion(suscripcionId: string | null) {
  if (!suscripcionId) return null;

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { id: suscripcionId },
    select: { id: true },
  });

  return suscripcion ? null : "Suscripcion no encontrada";
}

const pagoInclude = {
  suscripcion: {
    select: {
      id: true,
      nombre: true,
      estado: true,
      fechaRenovacion: true,
    },
  },
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
  const pago = await prisma.pago.findUnique({
    where: { id },
    include: pagoInclude,
  });

  if (!pago) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  return NextResponse.json(pago);
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
  const existing = await prisma.pago.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const fechaPago = data.fechaPago !== undefined ? parseDate(data.fechaPago) : undefined;
  if (fechaPago === undefined && data.fechaPago !== undefined) {
    return NextResponse.json({ error: "Fecha de pago invalida" }, { status: 400 });
  }

  const suscripcionId =
    data.suscripcionId !== undefined ? emptyToNull(data.suscripcionId) : undefined;
  if (suscripcionId !== undefined) {
    const relationError = await validateSuscripcion(suscripcionId);
    if (relationError) {
      return NextResponse.json({ error: relationError }, { status: 400 });
    }
  }

  const pago = await prisma.pago.update({
    where: { id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.tipoPago !== undefined && { tipoPago: data.tipoPago }),
      ...(data.monto !== undefined && { monto: emptyToNull(data.monto) }),
      ...(data.montoPagadoNum !== undefined && { montoPagadoNum: data.montoPagadoNum }),
      ...(data.fechaPago !== undefined && { fechaPago }),
      ...(data.estadoPago !== undefined && { estadoPago: data.estadoPago }),
      ...(data.categorias !== undefined && { categorias: { set: data.categorias } }),
      ...(data.factura !== undefined && { factura: emptyToNull(data.factura) }),
      ...(data.tarjeta !== undefined && { tarjeta: emptyToNull(data.tarjeta) }),
      ...(data.duenioTarjeta !== undefined && { duenioTarjeta: data.duenioTarjeta }),
      ...(suscripcionId !== undefined && { suscripcionId }),
    },
    include: pagoInclude,
  });

  return NextResponse.json(pago);
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
  const existing = await prisma.pago.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  await prisma.pago.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
