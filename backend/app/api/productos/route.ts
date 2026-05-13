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

const productoSchema = z.object({
  sku: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  categoriaId: z.string().min(1),
  precioCosto: z.coerce.number().min(0),
  precioB2B: z.coerce.number().min(0),
  precioB2C: z.coerce.number().min(0),
  stockActual: z.coerce.number().int().min(0).default(0),
  stockMinimo: z.coerce.number().int().min(0).default(5),
  proveedorId: z.string().optional().nullable(),
  containerId: z.string().optional().nullable(),
  fotos: z.array(imageSchema).max(6).default([]),
  fotoPortada: z.string().optional().nullable(),
  estado: z.enum(PRODUCTO_ESTADOS as [ProductoEstado, ...ProductoEstado[]]).default("disponible"),
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

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const productos = await prisma.producto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categoria: { select: { id: true, nombre: true } },
      proveedor: { select: { id: true, nombre: true, pais: true } },
      container: { select: { id: true, numero: true, estado: true } },
      _count: { select: { itemsPedido: true } },
    },
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
    const producto = await prisma.producto.create({
      data: {
        sku: data.sku.trim(),
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        categoriaId: data.categoriaId,
        precioCosto: data.precioCosto,
        precioB2B: data.precioB2B,
        precioB2C: data.precioB2C,
        stockActual: data.stockActual,
        stockMinimo: data.stockMinimo,
        proveedorId,
        containerId,
        fotos,
        fotoPortada,
        estado: data.estado,
        notas: data.notas?.trim() || null,
      },
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
