import { NextRequest, NextResponse } from "next/server";
import type { InventarioMovimientoTipo } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import { createInventoryMovement } from "@/src/lib/inventory";

const MOVIMIENTO_TIPOS: InventarioMovimientoTipo[] = [
  "ingreso_disponible",
  "ingreso_transito",
  "confirmacion_transito",
  "salida",
  "devolucion",
  "merma",
  "ajuste_disponible",
  "ajuste_transito",
];

const movimientoSchema = z.object({
  tipo: z.enum(MOVIMIENTO_TIPOS as [InventarioMovimientoTipo, ...InventarioMovimientoTipo[]]),
  cantidad: z.coerce.number().int(),
  containerId: z.string().optional().nullable(),
  nota: z.string().optional().nullable(),
});

function normalizeOptionalId(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : null;
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
  const movimientos = await prisma.inventarioMovimiento.findMany({
    where: { productoId: id },
    orderBy: { createdAt: "desc" },
    include: {
      container: { select: { id: true, numero: true } },
    },
  });

  return NextResponse.json(movimientos);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = movimientoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      containerId: true,
      archivadoAt: true,
      inventario: { select: { id: true } },
    },
  });

  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  if (producto.archivadoAt) {
    return NextResponse.json(
      { error: "No se puede mover inventario de un producto archivado" },
      { status: 409 }
    );
  }

  const containerId = normalizeOptionalId(data.containerId) ?? producto.containerId;

  if (["ingreso_transito", "confirmacion_transito"].includes(data.tipo) && !containerId) {
    return NextResponse.json(
      { error: "El movimiento de stock en transito requiere un container" },
      { status: 400 }
    );
  }

  if (containerId) {
    const container = await prisma.container.findUnique({
      where: { id: containerId },
      select: { id: true },
    });
    if (!container) {
      return NextResponse.json({ error: "Container no encontrado" }, { status: 400 });
    }
  }

  try {
    const inventario = await prisma.$transaction(async (tx) => {
      if (!producto.inventario) {
        await tx.inventario.create({
          data: {
            productoId: id,
            stockDisponible: 0,
            stockEnTransito: 0,
            stockMinimo: 5,
          },
        });
      }

      return createInventoryMovement(tx, {
        productoId: id,
        tipo: data.tipo,
        cantidad: data.cantidad,
        containerId,
        nota: data.nota,
      });
    });

    return NextResponse.json(inventario, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo registrar el movimiento" },
      { status: 400 }
    );
  }
}
