import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";
import { createInventoryMovement, deriveProductStatus } from "@/src/lib/inventory";

const imageSchema = z.string().min(1).max(3_000_000);

const productoSchema = z.object({
  sku: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  categoriaId: z.string().min(1),
  precioCosto: z.coerce.number().min(0),
  precioB2B: z.coerce.number().min(0),
  precioB2C: z.coerce.number().min(0),
  stockDisponible: z.coerce.number().int().min(0).default(0),
  stockEnTransito: z.coerce.number().int().min(0).default(0),
  stockMinimo: z.coerce.number().int().min(0).default(5),
  ubicacion: z.string().optional().nullable(),
  proveedorId: z.string().optional().nullable(),
  containerId: z.string().optional().nullable(),
  fotos: z.array(imageSchema).max(6).default([]),
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
  categoriaId: string;
  proveedorId: string | null;
  containerId: string | null;
}) {
  const [categoria, proveedor, container] = await Promise.all([
    prisma.categoria.findUnique({ where: { id: categoriaId }, select: { id: true } }),
    proveedorId
      ? prisma.proveedor.findUnique({ where: { id: proveedorId }, select: { id: true } })
      : Promise.resolve(null),
    containerId
      ? prisma.container.findUnique({ where: { id: containerId }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  if (!categoria) return "Categoria no encontrada";
  if (proveedorId && !proveedor) return "Proveedor no encontrado";
  if (containerId && !container) return "Container no encontrado";
  return null;
}

const productInclude = {
  categoria: { select: { id: true, nombre: true } },
  proveedor: { select: { id: true, nombre: true, pais: true } },
  container: { select: { id: true, numero: true, estado: true } },
  inventario: {
    select: {
      id: true,
      stockDisponible: true,
      stockEnTransito: true,
      stockMinimo: true,
      ubicacion: true,
      updatedAt: true,
    },
  },
  _count: { select: { itemsPedido: true } },
} as const;

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const includeArchived = req.nextUrl.searchParams.get("includeArchived") === "true";

  const productos = await prisma.producto.findMany({
    where: includeArchived ? undefined : { archivadoAt: null },
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });

  return NextResponse.json(productos);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = productoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const proveedorId = normalizeOptionalId(data.proveedorId);
  const containerId = normalizeOptionalId(data.containerId);

  if (data.stockEnTransito > 0 && !containerId) {
    return NextResponse.json(
      { error: "El stock en transito debe estar asociado a un container" },
      { status: 400 }
    );
  }

  const relationError = await validateRelations({
    categoriaId: data.categoriaId,
    proveedorId,
    containerId,
  });

  if (relationError) {
    return NextResponse.json({ error: relationError }, { status: 400 });
  }

  const { fotos, fotoPortada } = normalizeProductImages(data.fotos, data.fotoPortada);

  try {
    const productoId = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: {
          sku: data.sku.trim(),
          nombre: data.nombre.trim(),
          descripcion: data.descripcion?.trim() || null,
          categoriaId: data.categoriaId,
          precioCosto: data.precioCosto,
          precioB2B: data.precioB2B,
          precioB2C: data.precioB2C,
          proveedorId,
          containerId,
          fotos,
          fotoPortada,
          estado: deriveProductStatus({
            stockDisponible: data.stockDisponible,
            stockEnTransito: data.stockEnTransito,
          }),
          notas: data.notas?.trim() || null,
        },
      });

      await tx.inventario.create({
        data: {
          productoId: producto.id,
          stockDisponible: 0,
          stockEnTransito: 0,
          stockMinimo: data.stockMinimo,
          ubicacion: data.ubicacion?.trim() || null,
        },
      });

      if (data.stockDisponible > 0) {
        await createInventoryMovement(tx, {
          productoId: producto.id,
          tipo: "ingreso_disponible",
          cantidad: data.stockDisponible,
          nota: "Stock inicial disponible",
        });
      }

      if (data.stockEnTransito > 0) {
        await createInventoryMovement(tx, {
          productoId: producto.id,
          tipo: "ingreso_transito",
          cantidad: data.stockEnTransito,
          containerId,
          nota: "Stock inicial en transito",
        });
      }

      if (data.stockDisponible === 0 && data.stockEnTransito === 0) {
        await createInventoryMovement(tx, {
          productoId: producto.id,
          tipo: "ajuste_disponible",
          cantidad: 0,
          allowZero: true,
          nota: "Producto creado sin stock inicial",
        });
      }

      return producto.id;
    });

    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
      include: productInclude,
    });

    return NextResponse.json(producto, { status: 201 });
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
