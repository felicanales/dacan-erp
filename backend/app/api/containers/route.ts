import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

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

const containerSchema = z.object({
  numero: z.string().min(1),
  proveedorId: z.string().min(1),
  puertoOrigen: z.string().min(1),
  puertoDestino: z.string().default("San Antonio"),
  fechaSalida: z.string().datetime({ offset: true }).optional().nullable(),
  fechaArriboEstimada: z.string().datetime({ offset: true }).optional().nullable(),
  costoTotal: z.number().positive().optional().nullable(),
  contenidoResumen: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const containers = await prisma.container.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      proveedor: { select: { id: true, nombre: true, pais: true } },
      _count: { select: { productos: true } },
    },
  });

  return NextResponse.json(containers);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = containerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const proveedorExiste = await prisma.proveedor.findUnique({
    where: { id: data.proveedorId },
  });
  if (!proveedorExiste) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 400 });
  }

  const container = await prisma.$transaction(async (tx) => {
    const c = await tx.container.create({
      data: {
        numero: data.numero,
        proveedorId: data.proveedorId,
        puertoOrigen: data.puertoOrigen,
        puertoDestino: data.puertoDestino,
        fechaSalida: data.fechaSalida ? new Date(data.fechaSalida) : null,
        fechaArriboEstimada: data.fechaArriboEstimada
          ? new Date(data.fechaArriboEstimada)
          : null,
        costoTotal: data.costoTotal ?? null,
        contenidoResumen: data.contenidoResumen ?? null,
        notas: data.notas ?? null,
      },
    });

    await tx.containerHistorialEstado.create({
      data: { containerId: c.id, estado: "en_preparacion", nota: "Container creado" },
    });

    return c;
  });

  return NextResponse.json(container, { status: 201 });
}
