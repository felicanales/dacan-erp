import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { PaginaCrearButton } from "@/components/paginas/PaginaCrearButton";
import { CarpetaCrearButton } from "@/components/paginas/CarpetaCrearButton";
import { CarpetaEliminarButton } from "@/components/paginas/CarpetaEliminarButton";
import { PaginaCard } from "@/components/paginas/PaginaCard";
import { CarpetaCard } from "@/components/paginas/CarpetaCard";

type Pagina = {
  id: string;
  nombre: string | null;
  titulo: string;
  icono: string | null;
  carpetaId: string | null;
  createdAt: string;
  updatedAt: string;
};

type Carpeta = {
  id: string;
  nombre: string;
  icono: string | null;
  _count: { paginas: number };
};

async function getPaginas(carpetaId?: string): Promise<Pagina[]> {
  try {
    const qs = carpetaId ? `?carpetaId=${carpetaId}` : "?carpetaId=ninguna";
    return await apiFetch<Pagina[]>(`/api/paginas${qs}`);
  } catch {
    return [];
  }
}

async function getCarpetas(): Promise<Carpeta[]> {
  try {
    return await apiFetch<Carpeta[]>("/api/carpetas");
  } catch {
    return [];
  }
}

async function getCarpeta(id: string): Promise<Carpeta | null> {
  try {
    return await apiFetch<Carpeta>(`/api/carpetas/${id}`);
  } catch {
    return null;
  }
}

export default async function PaginasPage({
  searchParams,
}: {
  searchParams: Promise<{ carpeta?: string }>;
}) {
  const { carpeta: carpetaId } = await searchParams;

  if (carpetaId) {
    const [carpeta, paginas, todasLasCarpetas] = await Promise.all([
      getCarpeta(carpetaId),
      getPaginas(carpetaId),
      getCarpetas(),
    ]);

    return (
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <nav className="mb-1 flex min-w-0 items-center gap-1 text-sm text-gray-400">
              <Link href="/paginas" className="transition-colors hover:text-gray-700">
                Paginas
              </Link>
              <ChevronRight className="h-3.5 w-3.5 flex-none" />
              <span className="truncate font-medium text-gray-800">
                {carpeta?.icono ? `${carpeta.icono} ` : ""}
                {carpeta?.nombre ?? "Carpeta"}
              </span>
            </nav>
            <p className="text-sm text-gray-500">
              {paginas.length === 0
                ? "Esta carpeta esta vacia"
                : `${paginas.length} documento${paginas.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {carpeta && (
              <CarpetaEliminarButton
                id={carpeta.id}
                nombre={carpeta.nombre}
                count={carpeta._count.paginas}
                redirectTo="/paginas"
              />
            )}
            <PaginaCrearButton carpetaId={carpetaId} />
          </div>
        </div>

        {paginas.length === 0 ? (
          <EmptyState
            title="No hay documentos"
            description="Crea uno nuevo o mueve un documento existente a esta carpeta."
            action={<PaginaCrearButton carpetaId={carpetaId} />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paginas.map((pagina) => (
              <PaginaCard key={pagina.id} {...pagina} carpetas={todasLasCarpetas} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const [carpetas, paginasSinCarpeta] = await Promise.all([getCarpetas(), getPaginas()]);
  const hayContenido = carpetas.length > 0 || paginasSinCarpeta.length > 0;

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Paginas</h1>
          <p className="mt-1 text-sm text-gray-500">Documentos y notas del equipo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CarpetaCrearButton />
          <PaginaCrearButton />
        </div>
      </div>

      {!hayContenido ? (
        <EmptyState
          title="No hay paginas"
          description="Crea un documento para empezar."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <CarpetaCrearButton />
              <PaginaCrearButton />
            </div>
          }
        />
      ) : (
        <div className="space-y-8">
          {carpetas.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Carpetas
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {carpetas.map((carpeta) => (
                  <CarpetaCard
                    key={carpeta.id}
                    id={carpeta.id}
                    nombre={carpeta.nombre}
                    icono={carpeta.icono}
                    count={carpeta._count.paginas}
                  />
                ))}
              </div>
            </section>
          )}

          {paginasSinCarpeta.length > 0 && (
            <section className="space-y-3">
              {carpetas.length > 0 && (
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Sin carpeta
                </h2>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {paginasSinCarpeta.map((pagina) => (
                  <PaginaCard key={pagina.id} {...pagina} carpetas={carpetas} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gray-50">
        <FileText className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-950">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  );
}
