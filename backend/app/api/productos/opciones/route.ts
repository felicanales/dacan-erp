import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [categorias, proveedores, containers] = await Promise.all([
    prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.proveedor.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, pais: true },
    }),
    prisma.container.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, numero: true, estado: true },
    }),
  ]);

  return NextResponse.json({ categorias, proveedores, containers });
}
