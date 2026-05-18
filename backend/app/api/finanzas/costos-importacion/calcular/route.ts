import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/src/lib/api-auth";
import { calcularCostoImportacion } from "@/src/lib/finanzas/calculadora-importacion";

const calculoSchema = z.object({
  fob: z.coerce.number().nonnegative(),
  flete: z.coerce.number().nonnegative(),
  seguro: z.coerce.number().nonnegative(),
  arancel: z.coerce.number().min(0).max(1).optional(),
  iva: z.coerce.number().min(0).max(1).optional(),
  costosLocales: z.coerce.number().nonnegative().optional(),
  cantidadUnidades: z.coerce.number().int().positive().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = calculoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  return NextResponse.json(
    calcularCostoImportacion({
      ...parsed.data,
      cantidadUnidades: parsed.data.cantidadUnidades ?? undefined,
    })
  );
}
