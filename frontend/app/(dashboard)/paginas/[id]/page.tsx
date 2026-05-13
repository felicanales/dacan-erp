import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { PaginaEditor } from "@/components/paginas/PaginaEditor";

type Pagina = {
  id: string;
  titulo: string;
  icono: string | null;
  contenido: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

async function getPagina(id: string): Promise<Pagina | null> {
  try {
    return await apiFetch<Pagina>(`/api/paginas/${id}`);
  } catch {
    return null;
  }
}

export default async function PaginaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pagina = await getPagina(id);

  if (!pagina) notFound();

  return (
    <PaginaEditor
      id={pagina.id}
      initialTitulo={pagina.titulo}
      initialIcono={pagina.icono}
      initialContenido={pagina.contenido}
    />
  );
}
