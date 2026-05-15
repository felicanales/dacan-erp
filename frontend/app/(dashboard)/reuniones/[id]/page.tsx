import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { NotasIaForm } from "@/components/reuniones/NotasIaForm";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  timezone: string;
};

type Reunion = {
  id: string;
  titulo: string;
  fecha: string;
  estado: "programada" | "completada" | "cancelada";
  linkVideoCall: string | null;
  notasIa: string | null;
  participantes: { usuario: Usuario }[];
};

const ESTADO_LABELS: Record<Reunion["estado"], string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const ESTADO_BADGE: Record<Reunion["estado"], string> = {
  programada: "bg-blue-50 text-blue-700 border-blue-200",
  completada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelada: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getReunion(id: string): Promise<Reunion | null> {
  try {
    return await apiFetch<Reunion>(`/api/reuniones/${id}`);
  } catch {
    return null;
  }
}

export default async function ReunionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reunion = await getReunion(id);

  if (!reunion) notFound();

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div>
        <Link
          href="/reuniones"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Reuniones
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{reunion.titulo}</h1>
          <span
            className={[
              "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
              ESTADO_BADGE[reunion.estado],
            ].join(" ")}
          >
            {ESTADO_LABELS[reunion.estado]}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatFecha(reunion.fecha)}
          </span>
          {reunion.linkVideoCall && (
            <Link
              href={reunion.linkVideoCall}
              target="_blank"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              Videollamada
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Participantes</h2>
        <div className="flex flex-wrap gap-2">
          {reunion.participantes.map(({ usuario }) => (
            <span
              key={usuario.id}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-500">
                {usuario.nombre.slice(0, 1).toUpperCase()}
              </span>
              {usuario.nombre}
            </span>
          ))}
        </div>
      </section>

      <NotasIaForm reunionId={reunion.id} defaultNotasIa={reunion.notasIa} />
    </div>
  );
}
