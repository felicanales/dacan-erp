import { FileText, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { PaginaCrearButton } from "@/components/paginas/PaginaCrearButton";
import { CarpetaCrearButton } from "@/components/paginas/CarpetaCrearButton";
import { CarpetaEliminarButton } from "@/components/paginas/CarpetaEliminarButton";
import { PaginaCard } from "@/components/paginas/PaginaCard";
import { CarpetaCard } from "@/components/paginas/CarpetaCard";
import Link from "next/link";

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

  // ─── Vista de carpeta específica ────────────────────────
  if (carpetaId) {
    const [carpeta, paginas, todasLasCarpetas] = await Promise.all([
      getCarpeta(carpetaId),
      getPaginas(carpetaId),
      getCarpetas(),
    ]);

    return (
      <div className="w-full max-w-5xl space-y-6">
        {/* Header con breadcrumb */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <nav className="mb-1 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/paginas" className="hover:text-gray-600 transition-colors">
                Páginas
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-gray-700">
                {carpeta?.icono ? `${carpeta.icono} ` : ""}{carpeta?.nombre ?? "Carpeta"}
              </span>
            </nav>
            <p className="text-sm text-gray-500">
              {paginas.length === 0
                ? "Esta carpeta está vacía"
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No hay documentos en esta carpeta</p>
            <p className="mt-1 text-sm text-gray-500">Crea uno o mueve un documento existente aquí.</p>
            <div className="mt-4">
              <PaginaCrearButton carpetaId={carpetaId} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginas.map((p) => (
              <PaginaCard
                key={p.id}
                {...p}
                carpetas={todasLasCarpetas}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Vista principal (carpetas + páginas sin carpeta) ───
  const [carpetas, paginasSinCarpeta] = await Promise.all([
    getCarpetas(),
    getPaginas(),
  ]);

  const hayContenido = carpetas.length > 0 || paginasSinCarpeta.length > 0;

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Páginas</h1>
          <p className="mt-1 text-sm text-gray-500">Documentos y notas del equipo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CarpetaCrearButton />
          <PaginaCrearButton />
        </div>
      </div>

      {!hayContenido ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No hay páginas aún</p>
          <p className="mt-1 text-sm text-gray-500">Crea una página o carpeta para empezar.</p>
          <div className="mt-4 flex gap-2">
            <CarpetaCrearButton />
            <PaginaCrearButton />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Carpetas */}
          {carpetas.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Carpetas
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

          {/* Páginas sin carpeta */}
          {paginasSinCarpeta.length > 0 && (
            <section className="space-y-3">
              {carpetas.length > 0 && (
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Sin carpeta
                </h2>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {paginasSinCarpeta.map((p) => (
                  <PaginaCard
                    key={p.id}
                    {...p}
                    carpetas={carpetas}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
