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

const updateSchema = z.object({
  nombre: z.string().min(1).optional(),
  pais: z.string().min(1).optional(),
  ciudad: z.string().optional().nullable(),
  contactoNombre: z.string().optional().nullable(),
  contactoEmail: z.string().email().optional().nullable().or(z.literal("")),
  contactoTelefono: z.string().optional().nullable(),
  moneda: z.string().optional(),
  condicionesPago: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
  activo: z.boolean().optional(),
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
  const proveedor = await prisma.proveedor.findUnique({
    where: { id },
    include: {
      productos: {
        select: {
          id: true,
          nombre: true,
          sku: true,
          estado: true,
          container: {
            select: {
              id: true,
              numero: true,
              estado: true,
              fechaArriboEstimada: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!proveedor) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  }

  const { productos, ...rest } = proveedor;
  const containersById = new Map<
    string,
    {
      id: string;
      numero: string;
      estado: string;
      fechaArriboEstimada: Date | null;
      createdAt: Date;
    }
  >();

  for (const producto of productos) {
    if (producto.container) {
      containersById.set(producto.container.id, producto.container);
    }
  }

  return NextResponse.json({
    ...rest,
    productos: productos.map(({ container, ...producto }) => producto),
    containers: [...containersById.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(({ createdAt, ...container }) => container),
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.proveedor.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  }

  const data = parsed.data;
  const proveedor = await prisma.proveedor.update({
    where: { id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.pais !== undefined && { pais: data.pais }),
      ...(data.ciudad !== undefined && { ciudad: data.ciudad }),
      ...(data.contactoNombre !== undefined && { contactoNombre: data.contactoNombre }),
      ...(data.contactoEmail !== undefined && { contactoEmail: data.contactoEmail || null }),
      ...(data.contactoTelefono !== undefined && { contactoTelefono: data.contactoTelefono }),
      ...(data.moneda !== undefined && { moneda: data.moneda }),
      ...(data.condicionesPago !== undefined && { condicionesPago: data.condicionesPago }),
      ...(data.notas !== undefined && { notas: data.notas }),
      ...(data.activo !== undefined && { activo: data.activo }),
    },
  });

  return NextResponse.json(proveedor);
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
  const existing = await prisma.proveedor.findUnique({
    where: { id },
    include: {
      _count: { select: { productos: true } },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  }

  if (existing._count.productos > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar un proveedor con productos asociados" },
      { status: 409 }
    );
  }

  await prisma.proveedor.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
