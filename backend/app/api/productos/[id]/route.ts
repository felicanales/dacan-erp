import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import { syncProductStatus } from "@/src/lib/inventory";

const imageSchema = z.string().min(1).max(3_000_000);

const updateSchema = z.object({
  sku: z.string().min(1).optional(),
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional().nullable(),
  categoriaId: z.string().min(1).optional(),
  precioCosto: z.coerce.number().min(0).optional(),
  precioB2B: z.coerce.number().min(0).optional(),
  precioB2C: z.coerce.number().min(0).optional(),
  stockMinimo: z.coerce.number().int().min(0).optional(),
  ubicacion: z.string().optional().nullable(),
  proveedorId: z.string().optional().nullable(),
  containerId: z.string().optional().nullable(),
  fotos: z.array(imageSchema).max(6).optional(),
  fotoPortada: z.string().optional().nullable(),
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

const productInclude = {
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
  inventario: {
    select: {
      id: true,
      stockDisponible: true,
      stockEnTransito: true,
      stockMinimo: true,
      ubicacion: true,
      updatedAt: true,
      movimientos: {
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          tipo: true,
          cantidad: true,
          stockDisponibleAntes: true,
          stockDisponibleDespues: true,
          stockEnTransitoAntes: true,
          stockEnTransitoDespues: true,
          nota: true,
          createdAt: true,
          container: { select: { id: true, numero: true } },
        },
      },
    },
  },
  _count: { select: { itemsPedido: true, movimientosInventario: true } },
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
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: productInclude,
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
  const existing = await prisma.producto.findUnique({
    where: { id },
    include: { inventario: true },
  });
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

  if (
    containerId === null &&
    (existing.inventario?.stockEnTransito ?? 0) > 0
  ) {
    return NextResponse.json(
      { error: "No puedes quitar el container mientras exista stock en transito" },
      { status: 409 }
    );
  }

  const imageUpdate =
    data.fotos !== undefined
      ? normalizeProductImages(data.fotos, data.fotoPortada)
      : data.fotoPortada !== undefined
        ? normalizeProductImages(existing.fotos, data.fotoPortada)
        : undefined;

  try {
    const productoId = await prisma.$transaction(async (tx) => {
      await tx.producto.update({
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
          ...(proveedorId !== undefined && { proveedorId }),
          ...(containerId !== undefined && { containerId }),
          ...(imageUpdate !== undefined && {
            fotos: imageUpdate.fotos,
            fotoPortada: imageUpdate.fotoPortada,
          }),
          ...(data.notas !== undefined && { notas: data.notas?.trim() || null }),
        },
      });

      if (data.stockMinimo !== undefined || data.ubicacion !== undefined) {
        await tx.inventario.upsert({
          where: { productoId: id },
          create: {
            productoId: id,
            stockDisponible: 0,
            stockEnTransito: 0,
            stockMinimo: data.stockMinimo ?? 5,
            ubicacion: data.ubicacion?.trim() || null,
          },
          update: {
            ...(data.stockMinimo !== undefined && { stockMinimo: data.stockMinimo }),
            ...(data.ubicacion !== undefined && { ubicacion: data.ubicacion?.trim() || null }),
          },
        });
      }

      await syncProductStatus(tx, id);
      return id;
    });

    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
      include: productInclude,
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
  const existing = await prisma.producto.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  if (existing.archivadoAt) {
    return NextResponse.json({ ok: true });
  }

  await prisma.producto.update({
    where: { id },
    data: {
      archivadoAt: new Date(),
      archivadoMotivo: "Archivado desde modulo de productos",
      estado: "descontinuado",
    },
  });

  return NextResponse.json({ ok: true });
}
