import Link from "next/link";
import { Ban, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReunionActions } from "@/components/reuniones/ReunionActions";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  timezone: string;
};

type ReunionEstado = "programada" | "completada" | "cancelada";

type Reunion = {
  id: string;
  titulo: string;
  fecha: string;
  estado: ReunionEstado;
  participantes: { usuario: Usuario }[];
};

const ESTADO_LABELS: Record<ReunionEstado, string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const ESTADO_BADGE: Record<ReunionEstado, string> = {
  programada: "bg-blue-50 text-blue-700 border-blue-200",
  completada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelada: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getReuniones(): Promise<Reunion[]> {
  try {
    return await apiFetch<Reunion[]>("/api/reuniones");
  } catch {
    return [];
  }
}

export default async function ReunionesPage() {
  const reuniones = await getReuniones();
  const total = reuniones.length;
  const programadas = reuniones.filter((reunion) => reunion.estado === "programada").length;
  const completadas = reuniones.filter((reunion) => reunion.estado === "completada").length;
  const canceladas = reuniones.filter((reunion) => reunion.estado === "cancelada").length;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reuniones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Notas IA y seguimiento de reuniones del equipo.
          </p>
        </div>
        <Link
          href="/reuniones/nueva"
          className={cn(
            buttonVariants(),
            "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
          )}
        >
          + Nueva reunion
        </Link>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total", value: total, icon: CalendarDays },
            { label: "Programadas", value: programadas, icon: Clock },
            { label: "Completadas", value: completadas, icon: CheckCircle2 },
            { label: "Canceladas", value: canceladas, icon: Ban },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
              <Icon className="h-4 w-4 text-gray-400" />
              <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
              <p className="mt-1 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {reuniones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center sm:py-16">
          <CalendarDays className="h-8 w-8 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900">No hay reuniones</p>
          <p className="mt-1 text-sm text-gray-500">
            Crea una reunion para guardar sus datos basicos y notas IA.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {reuniones.map((reunion) => (
              <article
                key={reunion.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/reuniones/${reunion.id}`}
                      className="block truncate text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {reunion.titulo}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">{formatFecha(reunion.fecha)}</p>
                  </div>
                  <span
                    className={[
                      "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                      ESTADO_BADGE[reunion.estado],
                    ].join(" ")}
                  >
                    {ESTADO_LABELS[reunion.estado]}
                  </span>
                </div>
                <p className="mt-3 truncate text-sm text-gray-500">
                  {reunion.participantes.map((p) => p.usuario.nombre).join(", ")}
                </p>
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <ReunionActions reunionId={reunion.id} titulo={reunion.titulo} />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  {["Titulo", "Fecha", "Participantes", "Estado", "Acciones"].map((head) => (
                    <TableHead
                      key={head}
                      className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reuniones.map((reunion) => (
                  <TableRow key={reunion.id} className="border-b border-gray-200">
                    <TableCell className="px-4 py-3">
                      <Link
                        href={`/reuniones/${reunion.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {reunion.titulo}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500">
                      {formatFecha(reunion.fecha)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="max-w-64 truncate text-sm text-gray-500">
                        {reunion.participantes.map((p) => p.usuario.nombre).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                          ESTADO_BADGE[reunion.estado],
                        ].join(" ")}
                      >
                        {ESTADO_LABELS[reunion.estado]}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <ReunionActions reunionId={reunion.id} titulo={reunion.titulo} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
