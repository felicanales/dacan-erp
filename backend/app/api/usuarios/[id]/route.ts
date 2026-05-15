import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifyAuth } from "@/src/lib/api-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = await verifyAuth(req);
  if (!claims) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, activo: true, clerkId: true },
  });

  if (!usuario) {
    return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
  }

  if (usuario.clerkId === claims.sub) {
    return NextResponse.json(
      { error: "No puedes eliminar tu propio usuario" },
      { status: 400 }
    );
  }

  if (!usuario.activo) {
    return NextResponse.json({ ok: true });
  }

  await prisma.usuario.update({
    where: { id },
    data: { activo: false },
  });

  return NextResponse.json({ ok: true });
}
