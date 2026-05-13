import { FileText } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { PaginaCrearButton } from "@/components/paginas/PaginaCrearButton";
import Link from "next/link";

type Pagina = {
  id: string;
  titulo: string;
  icono: string | null;
  createdAt: string;
  updatedAt: string;
};

async function getPaginas(): Promise<Pagina[]> {
  try {
    return await apiFetch<Pagina[]>("/api/paginas");
  } catch {
    return [];
  }
}

function formatFecha(iso: string) {
  const date = new Date(iso);
  const ahora = new Date();
  const diff = ahora.getTime() - date.getTime();
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 1) return "Justo ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function PaginasPage() {
  const paginas = await getPaginas();

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Páginas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Documentos y notas del equipo
          </p>
        </div>
        <PaginaCrearButton />
      </div>

      {paginas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No hay páginas aún</p>
          <p className="mt-1 text-sm text-gray-500">
            Crea una página para empezar a escribir.
          </p>
          <div className="mt-4">
            <PaginaCrearButton />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paginas.map((pagina) => (
            <Link
              key={pagina.id}
              href={`/paginas/${pagina.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">
                  {pagina.icono || "📄"}
                </span>
                <h2 className="flex-1 text-sm font-medium text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                  {pagina.titulo || "Sin título"}
                </h2>
              </div>
              <p className="text-xs text-gray-400">
                Editado {formatFecha(pagina.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
