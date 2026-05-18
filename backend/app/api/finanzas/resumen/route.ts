import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export async function GET(req: NextRequest) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { start, end } = currentMonthRange();

  const [
    totalPagadoMes,
    totalSuscripciones,
    costoSuscripcionesMes,
    pagosPendientes,
    proximasRenovaciones,
  ] = await Promise.all([
    prisma.pago.aggregate({
      where: {
        estadoPago: "pagado",
        fechaPago: { gte: start, lt: end },
      },
      _sum: { montoPagadoNum: true },
    }),
    prisma.suscripcion.count({ where: { estado: "activa" } }),
    prisma.pago.aggregate({
      where: {
        tipoPago: "suscripcion",
        estadoPago: "pagado",
        fechaPago: { gte: start, lt: end },
      },
      _sum: { montoPagadoNum: true },
    }),
    prisma.pago.count({ where: { estadoPago: "pendiente" } }),
    prisma.suscripcion.findMany({
      where: {
        estado: "activa",
        fechaRenovacion: { not: null },
      },
      orderBy: { fechaRenovacion: "asc" },
      take: 5,
      select: {
        id: true,
        nombre: true,
        categoria: true,
        fechaRenovacion: true,
      },
    }),
  ]);

  return NextResponse.json({
    totalPagadoMes: Number(totalPagadoMes._sum.montoPagadoNum ?? 0),
    totalSuscripciones,
    costoSuscripcionesMes: Number(costoSuscripcionesMes._sum.montoPagadoNum ?? 0),
    pagosPendientes,
    proximasRenovaciones,
  });
}
