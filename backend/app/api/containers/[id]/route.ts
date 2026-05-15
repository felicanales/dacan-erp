import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";
import type { ContainerEstado } from "@prisma/client";
import { confirmContainerTransitStock } from "@/src/lib/inventory";

async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  } catch {
    return null;
  }
}

const ESTADOS_VALIDOS: ContainerEstado[] = [
  "en_preparacion",
  "en_transito",
  "en_aduana",
  "liberado",
  "descargado",
];

const updateSchema = z.object({
  numero: z.string().min(1).optional(),
  puertoOrigen: z.string().optional(),
  puertoDestino: z.string().optional(),
  fechaSalida: z.string().datetime({ offset: true }).optional().nullable(),
  fechaArriboEstimada: z.string().datetime({ offset: true }).optional().nullable(),
  fechaArriboReal: z.string().datetime({ offset: true }).optional().nullable(),
  costoTotal: z.number().positive().optional().nullable(),
  contenidoResumen: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
});

type ProveedorResumen = {
  id: string;
  nombre: string;
  pais: string;
};

function uniqueProveedores(
  productos: { proveedor: ProveedorResumen | null }[]
) {
  const byId = new Map<string, ProveedorResumen>();

  for (const producto of productos) {
    if (producto.proveedor) byId.set(producto.proveedor.id, producto.proveedor);
  }

  return [...byId.values()];
}

const cambioEstadoSchema = z.object({
  estado: z.enum([
    "en_preparacion",
    "en_transito",
    "en_aduana",
    "liberado",
    "descargado",
  ]),
  nota: z.string().optional(),
  confirmarStockTransito: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const container = await prisma.container.findUnique({
    where: { id },
    include: {
      productos: {
        select: {
          id: true,
          nombre: true,
          sku: true,
          estado: true,
          inventario: {
            select: {
              stockDisponible: true,
              stockEnTransito: true,
              stockMinimo: true,
            },
          },
          proveedor: { select: { id: true, nombre: true, pais: true } },
        },
      },
      historialEstados: {
        orderBy: { fecha: "desc" },
      },
    },
  });

  if (!container) {
    return NextResponse.json({ error: "Container no encontrado" }, { status: 404 });
  }

  const { productos, ...rest } = container;

  return NextResponse.json({
    ...rest,
    productos,
    proveedores: uniqueProveedores(productos),
  });
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

  // Cambio de estado (PATCH semántico vía PUT con campo "estado")
  if ("estado" in body && Object.keys(body).length <= 3) {
    const parsed = cambioEstadoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const existing = await prisma.container.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Container no encontrado" }, { status: 404 });
    }

    const nuevoEstado = parsed.data.estado as ContainerEstado;
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const container = await prisma.$transaction(async (tx) => {
      const updated = await tx.container.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          ...(nuevoEstado === "descargado" && !existing.fechaArriboReal
            ? { fechaArriboReal: new Date() }
            : {}),
        },
      });

      await tx.containerHistorialEstado.create({
        data: {
          containerId: id,
          estado: nuevoEstado,
          nota: parsed.data.nota ?? null,
        },
      });

      if (nuevoEstado === "descargado" && parsed.data.confirmarStockTransito) {
        await confirmContainerTransitStock(
          tx,
          id,
          parsed.data.nota ?? "Stock confirmado por descarga de container"
        );
      }

      return updated;
    });

    return NextResponse.json(container);
  }

  // Actualización de datos generales
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.container.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Container no encontrado" }, { status: 404 });
  }

  const data = parsed.data;
  const container = await prisma.container.update({
    where: { id },
    data: {
      ...(data.numero !== undefined && { numero: data.numero }),
      ...(data.puertoOrigen !== undefined && { puertoOrigen: data.puertoOrigen }),
      ...(data.puertoDestino !== undefined && { puertoDestino: data.puertoDestino }),
      ...(data.fechaSalida !== undefined && {
        fechaSalida: data.fechaSalida ? new Date(data.fechaSalida) : null,
      }),
      ...(data.fechaArriboEstimada !== undefined && {
        fechaArriboEstimada: data.fechaArriboEstimada
          ? new Date(data.fechaArriboEstimada)
          : null,
      }),
      ...(data.fechaArriboReal !== undefined && {
        fechaArriboReal: data.fechaArriboReal ? new Date(data.fechaArriboReal) : null,
      }),
      ...(data.costoTotal !== undefined && { costoTotal: data.costoTotal }),
      ...(data.contenidoResumen !== undefined && {
        contenidoResumen: data.contenidoResumen,
      }),
      ...(data.notas !== undefined && { notas: data.notas }),
    },
  });

  return NextResponse.json(container);
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
  const existing = await prisma.container.findUnique({
    where: { id },
    include: {
      _count: { select: { productos: true } },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Container no encontrado" }, { status: 404 });
  }

  if (existing._count.productos > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar un container con productos asociados" },
      { status: 409 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.containerHistorialEstado.deleteMany({ where: { containerId: id } });
    await tx.container.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
