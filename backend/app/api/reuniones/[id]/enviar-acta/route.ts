import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const reunion = await prisma.reunion.findUnique({ where: { id } });
  if (!reunion) {
    return NextResponse.json({ error: "Reunion no encontrada" }, { status: 404 });
  }

  if (reunion.actaEnviada) {
    return NextResponse.json(
      { error: "El acta ya fue marcada como enviada" },
      { status: 409 }
    );
  }

  if (!reunion.acta && !reunion.acuerdos) {
    return NextResponse.json(
      { error: "Agrega acta o acuerdos antes de enviar el resumen" },
      { status: 400 }
    );
  }

  const updated = await prisma.reunion.update({
    where: { id },
    data: {
      actaEnviada: true,
      actaEnviadaAt: new Date(),
    },
  });

  return NextResponse.json({
    ...updated,
    emailSent: false,
    emailPendingConfiguration: true,
  });
}
