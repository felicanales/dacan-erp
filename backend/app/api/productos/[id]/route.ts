import { NextRequest, NextResponse } from "next/server";
import type { ProductoEstado } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";

const PRODUCTO_ESTADOS: ProductoEstado[] = [
  "disponible",
  "agotado",
  "en_transito",
  "descontinuado",
];

const imageSchema = z.string().min(1).max(3_000_000);

const updateSchema = z.object({
  sku: z.string().min(1).optional(),
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional().nullable(),
  categoriaId: z.string().min(1).optional(),
  precioCosto: z.coerce.number().min(0).optional(),
  precioB2B: z.coerce.number().min(0).optional(),
  precioB2C: z.coerce.number().min(0).optional(),
  stockActual: z.coerce.number().int().min(0).optional(),
  stockMinimo: z.coerce.number().int().min(0).optional(),
  proveedorId: z.string().optional().nullable(),
  containerId: z.string().optional().nullable(),
  fotos: z.array(imageSchema).max(6).optional(),
  fotoPortada: z.string().optional().nullable(),
  estado: z.enum(PRODUCTO_ESTADOS as [ProductoEstado, ...ProductoEstado[]]).optional(),
  notas: z.string().optional().nullable(),
});

function normalizeOptionalId(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : null;
}

function normalizeProductImages(fotos: string[], fotoPortada?: string | null) {
  const uniqueFotos = [...new Set(fotos.map((foto) => foto.trim()).filter(Boolean))];
  const portada =
    fotoPortada && uniqueFotos.includes(fotoPortada)
      ? fotoPortada
      : uniqueFotos[0] ?? null;

  return { fotos: uniqueFotos, fotoPortada: portada };
}

async function validateRelations({
  categoriaId,
  proveedorId,
  containerId,
}: {
  categoriaId?: string;
  proveedorId?: string | null;
  containerId?: string | null;
}) {
  const [categoria, proveedor, container] = await Promise.all([
    categoriaId
      ? prisma.categoria.findUnique({ where: { id: categoriaId }, select: { id: true } })
      : Promise.resolve({ id: "" }),
    proveedorId
      ? prisma.proveedor.findUnique({ where: { id: proveedorId }, select: { id: true } })
      : Promise.resolve(null),
    containerId
      ? prisma.container.findUnique({ where: { id: containerId }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  if (categoriaId && !categoria) return "Categoria no encontrada";
  if (proveedorId && !proveedor) return "Proveedor no encontrado";
  if (containerId && !container) return "Container no encontrado";
  return null;
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
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: {
      categoria: { select: { id: true, nombre: true, descripcion: true } },
      proveedor: {
        select: {
          id: true,
          nombre: true,
          pais: true,
          ciudad: true,
          contactoNombre: true,
          contactoEmail: true,
        },
      },
      container: {
        select: {
          id: true,
          numero: true,
          estado: true,
          fechaArriboEstimada: true,
          puertoOrigen: true,
          puertoDestino: true,
        },
      },
      inventario: { select: { id: true, cantidad: true, ubicacion: true, updatedAt: true } },
      _count: { select: { itemsPedido: true } },
    },
  });

  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(producto);
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
  const existing = await prisma.producto.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
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
  const proveedorId =
    data.proveedorId !== undefined ? normalizeOptionalId(data.proveedorId) : undefined;
  const containerId =
    data.containerId !== undefined ? normalizeOptionalId(data.containerId) : undefined;

  const relationError = await validateRelations({
    categoriaId: data.categoriaId,
    proveedorId,
    containerId,
  });

  if (relationError) {
    return NextResponse.json({ error: relationError }, { status: 400 });
  }

  const imageUpdate =
    data.fotos !== undefined
      ? normalizeProductImages(data.fotos, data.fotoPortada)
      : data.fotoPortada !== undefined
        ? normalizeProductImages(existing.fotos, data.fotoPortada)
        : undefined;

  try {
    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...(data.sku !== undefined && { sku: data.sku.trim() }),
        ...(data.nombre !== undefined && { nombre: data.nombre.trim() }),
        ...(data.descripcion !== undefined && {
          descripcion: data.descripcion?.trim() || null,
        }),
        ...(data.categoriaId !== undefined && { categoriaId: data.categoriaId }),
        ...(data.precioCosto !== undefined && { precioCosto: data.precioCosto }),
        ...(data.precioB2B !== undefined && { precioB2B: data.precioB2B }),
        ...(data.precioB2C !== undefined && { precioB2C: data.precioB2C }),
        ...(data.stockActual !== undefined && { stockActual: data.stockActual }),
        ...(data.stockMinimo !== undefined && { stockMinimo: data.stockMinimo }),
        ...(proveedorId !== undefined && { proveedorId }),
        ...(containerId !== undefined && { containerId }),
        ...(imageUpdate !== undefined && {
          fotos: imageUpdate.fotos,
          fotoPortada: imageUpdate.fotoPortada,
        }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.notas !== undefined && { notas: data.notas?.trim() || null }),
      },
    });

    return NextResponse.json(producto);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Ya existe un producto con ese SKU" }, { status: 409 });
    }

    throw error;
  }
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
  const existing = await prisma.producto.findUnique({
    where: { id },
    include: { _count: { select: { itemsPedido: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  if (existing._count.itemsPedido > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar un producto con pedidos asociados" },
      { status: 409 }
    );
  }

  await prisma.producto.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
