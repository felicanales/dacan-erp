import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import { calcularCostoImportacion } from "@/src/lib/finanzas/calculadora-importacion";

const costoInclude = {
  container: { select: { id: true, numero: true, estado: true } },
} as const;

function withCalculo(costo: {
  fob: unknown;
  flete: unknown;
  seguro: unknown;
  arancel: unknown;
  iva: unknown;
  costosLocales: unknown;
  cantidadUnidades: number | null;
}) {
  return calcularCostoImportacion({
    fob: Number(costo.fob),
    flete: Number(costo.flete),
    seguro: Number(costo.seguro),
    arancel: Number(costo.arancel),
    iva: Number(costo.iva),
    costosLocales: Number(costo.costosLocales),
    cantidadUnidades: costo.cantidadUnidades ?? undefined,
  });
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
  const costo = await prisma.costoImportacion.findUnique({
    where: { id },
    include: costoInclude,
  });

  if (!costo) {
    return NextResponse.json({ error: "Costo no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ...costo, calculo: withCalculo(costo) });
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
  const existing = await prisma.costoImportacion.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Costo no encontrado" }, { status: 404 });
  }

  await prisma.costoImportacion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
