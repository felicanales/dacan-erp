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
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Package, ArrowRight } from "lucide-react";

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

// Orden lógico del flujo
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

  const countByEstado = ESTADOS_FLUJO.reduce<Record<string, number>>((acc, e) => {
    acc[e] = containers.filter((c) => c.estado === e).length;
    return acc;
  }, {});

  const activos = containers.filter(
    (c) => c.estado !== "descargado"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Containers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Seguimiento de envíos internacionales
          </p>
        </div>
        <Button asChild>
          <Link href="/containers/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo container
          </Link>
        </Button>
      </div>

      {/* Pipeline de estados */}
      {containers.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {ESTADOS_FLUJO.map((estado) => {
            const count = countByEstado[estado] ?? 0;
            return (
              <div
                key={estado}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm text-center"
              >
                <p className="text-xl font-semibold text-gray-900">{count}</p>
                <StatusBadge
                  status={estado}
                  label={ESTADO_LABELS[estado]}
                  className="mt-1"
                />
              </div>
            );
          })}
        </div>
      )}

      {containers.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium">Sin containers registrados</p>
          <p className="text-gray-500 text-sm mt-1">
            Registra tu primer container para hacer seguimiento del envío.
          </p>
          <Button asChild className="mt-5">
            <Link href="/containers/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Agregar container
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{activos}</span> activo
              {activos !== 1 ? "s" : ""} ·{" "}
              <span className="font-semibold text-gray-900">{containers.length}</span> total
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Container</TableHead>
                <TableHead className="font-semibold text-gray-700">Proveedor</TableHead>
                <TableHead className="font-semibold text-gray-700">Ruta</TableHead>
                <TableHead className="font-semibold text-gray-700">Salida</TableHead>
                <TableHead className="font-semibold text-gray-700">Arribo</TableHead>
                <TableHead className="text-center font-semibold text-gray-700">
                  Productos
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  <TableCell>
                    <Link
                      href={`/containers/${c.id}`}
                      className="font-mono font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
                    >
                      {c.numero}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 text-sm">{c.proveedor.nombre}</span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {c.proveedor.pais}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {c.puertoOrigen}
                    </span>
                    <span className="text-gray-300 mx-1.5">→</span>
                    <span className="text-sm text-gray-600">{c.puertoDestino}</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatFecha(c.fechaSalida)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.fechaArriboReal ? (
                      <span className="text-emerald-600 font-medium">
                        {formatFecha(c.fechaArriboReal)}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {formatFecha(c.fechaArriboEstimada)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {c._count.productos}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={c.estado}
                      label={ESTADO_LABELS[c.estado] ?? c.estado}
                      dot
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/containers/${c.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </Link>
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
