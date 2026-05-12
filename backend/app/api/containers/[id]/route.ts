import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";
import type { ContainerEstado } from "@prisma/client";

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
  proveedorId: z.string().optional(),
  puertoOrigen: z.string().optional(),
  puertoDestino: z.string().optional(),
  fechaSalida: z.string().datetime({ offset: true }).optional().nullable(),
  fechaArriboEstimada: z.string().datetime({ offset: true }).optional().nullable(),
  fechaArriboReal: z.string().datetime({ offset: true }).optional().nullable(),
  costoTotal: z.number().positive().optional().nullable(),
  contenidoResumen: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
});

const cambioEstadoSchema = z.object({
  estado: z.enum([
    "en_preparacion",
    "en_transito",
    "en_aduana",
    "liberado",
    "descargado",
  ]),
  nota: z.string().optional(),
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
      proveedor: { select: { id: true, nombre: true, pais: true, ciudad: true } },
      productos: {
        select: { id: true, nombre: true, sku: true, estado: true, stockActual: true },
      },
      historialEstados: {
        orderBy: { fecha: "desc" },
      },
    },
  });

  if (!container) {
    return NextResponse.json({ error: "Container no encontrado" }, { status: 404 });
  }

  return NextResponse.json(container);
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
  if ("estado" in body && Object.keys(body).length <= 2) {
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
      ...(data.proveedorId !== undefined && { proveedorId: data.proveedorId }),
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
