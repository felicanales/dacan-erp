import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import { calcularCostoImportacion } from "@/src/lib/finanzas/calculadora-importacion";

const costoSchema = z.object({
  containerId: z.string().optional().nullable(),
  fob: z.coerce.number().nonnegative(),
  flete: z.coerce.number().nonnegative(),
  seguro: z.coerce.number().nonnegative(),
  arancel: z.coerce.number().min(0).max(1).default(0.06),
  iva: z.coerce.number().min(0).max(1).default(0.19),
  costosLocales: z.coerce.number().nonnegative().default(0),
  cantidadUnidades: z.coerce.number().int().positive().optional().nullable(),
  notas: z.string().optional().nullable(),
});

const costoInclude = {
  container: { select: { id: true, numero: true, estado: true } },
} as const;

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const costos = await prisma.costoImportacion.findMany({
    orderBy: { creadoEn: "desc" },
    include: costoInclude,
  });

  return NextResponse.json(
    costos.map((costo) => ({
      ...costo,
      calculo: calcularCostoImportacion({
        fob: Number(costo.fob),
        flete: Number(costo.flete),
        seguro: Number(costo.seguro),
        arancel: Number(costo.arancel),
        iva: Number(costo.iva),
        costosLocales: Number(costo.costosLocales),
        cantidadUnidades: costo.cantidadUnidades ?? undefined,
      }),
    }))
  );
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = costoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const containerId = data.containerId?.trim() || null;
  if (containerId) {
    const container = await prisma.container.findUnique({
      where: { id: containerId },
      select: { id: true },
    });
    if (!container) {
      return NextResponse.json({ error: "Container no encontrado" }, { status: 400 });
    }
  }

  const costo = await prisma.costoImportacion.create({
    data: {
      containerId,
      fob: data.fob,
      flete: data.flete,
      seguro: data.seguro,
      arancel: data.arancel,
      iva: data.iva,
      costosLocales: data.costosLocales,
      cantidadUnidades: data.cantidadUnidades ?? null,
      notas: data.notas?.trim() || null,
    },
    include: costoInclude,
  });

  return NextResponse.json(
    {
      ...costo,
      calculo: calcularCostoImportacion({
        fob: Number(costo.fob),
        flete: Number(costo.flete),
        seguro: Number(costo.seguro),
        arancel: Number(costo.arancel),
        iva: Number(costo.iva),
        costosLocales: Number(costo.costosLocales),
        cantidadUnidades: costo.cantidadUnidades ?? undefined,
      }),
    },
    { status: 201 }
  );
}
