import Link from "next/link";
import { Repeat2 } from "lucide-react";
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
import { BadgeEstadoSuscripcion } from "@/components/finanzas/BadgeEstadoSuscripcion";
import type { SuscripcionResumen } from "@/components/finanzas/types";
import {
  CATEGORIA_LABELS,
  formatDate,
} from "@/components/finanzas/finanzas-utils";

async function getSuscripciones(): Promise<SuscripcionResumen[]> {
  try {
    return await apiFetch<SuscripcionResumen[]>("/api/finanzas/suscripciones");
  } catch {
    return [];
  }
}

export default async function SuscripcionesPage() {
  const suscripciones = await getSuscripciones();

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Suscripciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Servicios recurrentes, renovaciones y estado de cobro.
          </p>
        </div>
        <Link
          href="/finanzas/suscripciones/nueva"
          className={cn(
            buttonVariants(),
            "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
          )}
        >
          + Nueva suscripcion
        </Link>
      </div>

      {suscripciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center sm:py-16">
          <Repeat2 className="h-8 w-8 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900">No hay suscripciones</p>
          <p className="mt-1 text-sm text-gray-500">
            Crea una suscripcion para controlar renovaciones y pagos recurrentes.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                {[
                  "Nombre",
                  "Categoria",
                  "Estado",
                  "Adquisicion",
                  "Renovacion",
                  "Pagos",
                ].map((head) => (
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
              {suscripciones.map((suscripcion) => (
                <TableRow key={suscripcion.id} className="border-b border-gray-200">
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                    {suscripcion.nombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500">
                    {suscripcion.categoria
                      ? CATEGORIA_LABELS[suscripcion.categoria]
                      : "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <BadgeEstadoSuscripcion estado={suscripcion.estado} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(suscripcion.fechaAdquisicion)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(suscripcion.fechaRenovacion)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500">
                    {suscripcion._count?.pagos ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
