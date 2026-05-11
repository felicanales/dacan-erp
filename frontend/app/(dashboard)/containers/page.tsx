import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

type Container = {
  id: string;
  numero: string;
  estado: string;
  puertoOrigen: string;
  puertoDestino: string;
  fechaSalida: string | null;
  fechaArriboEstimada: string | null;
  fechaArriboReal: string | null;
  proveedor: { id: string; nombre: string; pais: string };
  _count: { productos: number };
};

const ESTADO_LABELS: Record<string, string> = {
  en_preparacion: "En preparación",
  en_transito:    "En tránsito",
  en_aduana:      "En aduana",
  liberado:       "Liberado",
  descargado:     "Descargado",
};

const ESTADO_BADGE: Record<string, string> = {
  en_preparacion: "bg-gray-100 text-gray-500 border-gray-200",
  en_transito:    "bg-blue-50 text-blue-700 border-blue-200",
  en_aduana:      "bg-amber-50 text-amber-700 border-amber-200",
  liberado:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  descargado:     "bg-gray-100 text-gray-500 border-gray-200",
};

const ESTADO_DOT: Record<string, string> = {
  en_preparacion: "bg-gray-400",
  en_transito:    "bg-blue-500",
  en_aduana:      "bg-amber-500",
  liberado:       "bg-emerald-500",
  descargado:     "bg-gray-400",
};

const ESTADOS_FLUJO = [
  "en_preparacion",
  "en_transito",
  "en_aduana",
  "liberado",
  "descargado",
] as const;

function formatFecha(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function getContainers(): Promise<Container[]> {
  try {
    return await apiFetch<Container[]>("/api/containers");
  } catch {
    return [];
  }
}

export default async function ContainersPage() {
  const containers = await getContainers();
  const activos = containers.filter((c) => c.estado !== "descargado").length;
  const countByEstado = ESTADOS_FLUJO.reduce<Record<string, number>>((acc, e) => {
    acc[e] = containers.filter((c) => c.estado === e).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Containers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Seguimiento de envíos internacionales
          </p>
        </div>
        <Link
          href="/containers/nuevo"
          className={cn(buttonVariants(), "bg-blue-500 hover:bg-blue-600 text-white text-sm h-9")}
        >
          + Nuevo container
        </Link>
      </div>

      {/* Pipeline */}
      {containers.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {ESTADOS_FLUJO.map((estado) => (
            <div
              key={estado}
              className="bg-white border border-gray-200 rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-bold text-gray-900">
                {countByEstado[estado] ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ESTADO_LABELS[estado]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla / Empty state */}
      {containers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">No hay containers aún</p>
          <p className="text-sm text-gray-500 mt-1">
            Registra un container para hacer seguimiento del envío.
          </p>
          <Link
            href="/containers/nuevo"
            className={cn(buttonVariants(), "mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm h-9")}
          >
            + Nuevo container
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-900">{activos}</span> activo{activos !== 1 ? "s" : ""} ·{" "}
              <span className="font-semibold text-gray-900">{containers.length}</span> total
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                {["Container", "Proveedor", "Ruta", "Salida", "Arribo", "Productos", "Estado"].map((h) => (
                  <TableHead key={h} className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((c) => (
                <TableRow
                  key={c.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <TableCell className="py-3 px-4">
                    <Link
                      href={`/containers/${c.id}`}
                      className="font-mono text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {c.numero}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="text-sm text-gray-900">{c.proveedor.nombre}</span>
                    <span className="text-xs text-gray-500 block mt-0.5">{c.proveedor.pais}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="text-sm text-gray-500">
                      {c.puertoOrigen}
                      <span className="mx-1.5 text-gray-400">→</span>
                      {c.puertoDestino}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-500">
                    {formatFecha(c.fechaSalida)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    {c.fechaArriboReal ? (
                      <span className="text-emerald-700 font-medium">
                        {formatFecha(c.fechaArriboReal)}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {formatFecha(c.fechaArriboEstimada)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <span className="text-sm text-gray-900">{c._count.productos}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className={[
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                      ESTADO_BADGE[c.estado] ?? "bg-gray-100 text-gray-500 border-gray-200",
                    ].join(" ")}>
                      <span className={["h-1.5 w-1.5 rounded-full shrink-0", ESTADO_DOT[c.estado] ?? "bg-gray-400"].join(" ")} />
                      {ESTADO_LABELS[c.estado] ?? c.estado}
                    </span>
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
