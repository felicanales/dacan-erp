import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ReunionForm } from "@/components/reuniones/ReunionForm";
import { ActaForm } from "@/components/reuniones/ActaForm";
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
  duracionMinutos: number | null;
  tipo: "interna" | "con_proveedor" | "con_cliente";
  estado: "programada" | "completada" | "cancelada";
  linkVideoCall: string | null;
  agenda: string | null;
  acta: string | null;
  acuerdos: string | null;
  notasIa: string | null;
  actaEnviada: boolean;
  actaEnviadaAt: string | null;
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

const TIPO_LABELS: Record<Reunion["tipo"], string> = {
  interna: "Interna",
  con_proveedor: "Con proveedor",
  con_cliente: "Con cliente",
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

function toDateTimeLocal(iso: string) {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

async function getReunion(id: string): Promise<Reunion | null> {
  try {
    return await apiFetch<Reunion>(`/api/reuniones/${id}`);
  } catch {
    return null;
  }
}

async function getUsuarios(): Promise<Usuario[]> {
  try {
    return await apiFetch<Usuario[]>("/api/usuarios");
  } catch {
    return [];
  }
}

export default async function ReunionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reunion, usuarios] = await Promise.all([getReunion(id), getUsuarios()]);

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
          <span>{TIPO_LABELS[reunion.tipo]}</span>
          {reunion.duracionMinutos && <span>{reunion.duracionMinutos} min</span>}
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

      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Agenda</h2>
        {reunion.agenda ? (
          <div className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {reunion.agenda}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin agenda registrada.</p>
        )}
      </section>

      <NotasIaForm reunionId={reunion.id} defaultNotasIa={reunion.notasIa} />

      <ActaForm
        reunionId={reunion.id}
        defaultActa={reunion.acta}
        defaultAcuerdos={reunion.acuerdos}
        actaEnviada={reunion.actaEnviada}
        actaEnviadaAt={reunion.actaEnviadaAt}
      />

      <div id="editar">
        <ReunionForm
          usuarios={usuarios}
          reunionId={reunion.id}
          defaultValues={{
            titulo: reunion.titulo,
            fecha: toDateTimeLocal(reunion.fecha),
            duracionMinutos: reunion.duracionMinutos
              ? String(reunion.duracionMinutos)
              : "",
            tipo: reunion.tipo,
            estado: reunion.estado,
            linkVideoCall: reunion.linkVideoCall ?? "",
            agenda: reunion.agenda ?? "",
            participantes: reunion.participantes.map(({ usuario }) => usuario.id),
          }}
        />
      </div>
    </div>
  );
}
