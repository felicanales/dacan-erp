import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import {
  CATEGORIAS_FINANZAS,
  DUENIOS_TARJETA,
  ESTADOS_PAGO,
  TIPOS_PAGO,
  monthRange,
  normalizeEnumParam,
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

const pagoSchema = z.object({
  nombre: z.string().trim().min(1),
  tipoPago: tipoPagoSchema,
  monto: z.string().optional().nullable(),
  montoPagadoNum: z.coerce.number().min(0).optional().nullable(),
  fechaPago: z.string().optional().nullable(),
  estadoPago: estadoPagoSchema.default("pendiente"),
  categorias: z.array(categoriaSchema).default([]),
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

function isOtherPaymentsFilter(value: string | null) {
  if (!value) return false;
  return ["otros", "otros_pagos", "no_suscripcion"].includes(value.toLowerCase());
}

async function validateSuscripcion(suscripcionId: string | null) {
  if (!suscripcionId) return null;

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { id: suscripcionId },
    select: { id: true },
  });

  return suscripcion ? null : "Suscripcion no encontrada";
}

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const where: Prisma.PagoWhereInput = {};

  const tipoParam = params.get("tipo");
  const tipoPago = normalizeEnumParam(tipoParam, TIPOS_PAGO);
  if (isOtherPaymentsFilter(tipoParam)) {
    where.tipoPago = { not: "suscripcion" };
  } else if (tipoPago) {
    where.tipoPago = tipoPago;
  }

  const estadoPago = normalizeEnumParam(params.get("estado"), ESTADOS_PAGO);
  if (estadoPago) where.estadoPago = estadoPago;

  const categoria = normalizeEnumParam(params.get("categoria"), CATEGORIAS_FINANZAS);
  if (categoria) where.categorias = { has: categoria };

  const duenioTarjeta = normalizeEnumParam(params.get("duenioTarjeta"), DUENIOS_TARJETA);
  if (duenioTarjeta) where.duenioTarjeta = duenioTarjeta;

  const fechaPago = monthRange(params.get("mes"));
  if (fechaPago) where.fechaPago = fechaPago;

  const pagos = await prisma.pago.findMany({
    where,
    orderBy: [{ fechaPago: "desc" }, { creadoEn: "desc" }],
    include: {
      suscripcion: {
        select: {
          id: true,
          nombre: true,
          estado: true,
          fechaRenovacion: true,
        },
      },
    },
  });

  return NextResponse.json(pagos);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = pagoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const fechaPago = parseDate(data.fechaPago);
  if (fechaPago === undefined) {
    return NextResponse.json({ error: "Fecha de pago invalida" }, { status: 400 });
  }

  const suscripcionId = emptyToNull(data.suscripcionId);
  const relationError = await validateSuscripcion(suscripcionId);
  if (relationError) {
    return NextResponse.json({ error: relationError }, { status: 400 });
  }

  const pago = await prisma.pago.create({
    data: {
      nombre: data.nombre,
      tipoPago: data.tipoPago,
      monto: emptyToNull(data.monto),
      montoPagadoNum: data.montoPagadoNum ?? null,
      fechaPago,
      estadoPago: data.estadoPago,
      categorias: data.categorias,
      factura: emptyToNull(data.factura),
      tarjeta: emptyToNull(data.tarjeta),
      duenioTarjeta: data.duenioTarjeta ?? null,
      suscripcionId,
    },
    include: {
      suscripcion: {
        select: {
          id: true,
          nombre: true,
          estado: true,
          fechaRenovacion: true,
        },
      },
    },
  });

  return NextResponse.json(pago, { status: 201 });
}
