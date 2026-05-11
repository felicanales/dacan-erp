import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return await clerkClient.verifyToken(token);
  } catch {
    return null;
  }
}

const proveedorSchema = z.object({
  nombre: z.string().min(1),
  pais: z.string().min(1),
  ciudad: z.string().optional(),
  contactoNombre: z.string().optional(),
  contactoEmail: z.string().email().optional().or(z.literal("")),
  contactoTelefono: z.string().optional(),
  moneda: z.string().default("USD"),
  condicionesPago: z.string().optional(),
  notas: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: "asc" },
    include: {
      _count: { select: { productos: true, containers: true } },
    },
  });

  return NextResponse.json(proveedores);
}

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = proveedorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const proveedor = await prisma.proveedor.create({
    data: {
      nombre: data.nombre,
      pais: data.pais,
      ciudad: data.ciudad ?? null,
      contactoNombre: data.contactoNombre ?? null,
      contactoEmail: data.contactoEmail || null,
      contactoTelefono: data.contactoTelefono ?? null,
      moneda: data.moneda,
      condicionesPago: data.condicionesPago ?? null,
      notas: data.notas ?? null,
    },
  });

  return NextResponse.json(proveedor, { status: 201 });
}
