import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Calendar, DollarSign, Package } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContainerForm } from "@/components/containers/ContainerForm";
import { CambiarEstado } from "@/components/containers/CambiarEstado";

type ContainerEstado =
  | "en_preparacion"
  | "en_transito"
  | "en_aduana"
  | "liberado"
  | "descargado";

type HistorialEstado = {
  id: string;
  estado: ContainerEstado;
  nota: string | null;
  fecha: string;
};

type ProductoResumen = {
  id: string;
  nombre: string;
  sku: string;
  estado: string;
  stockActual: number;
};

type ContainerDetalle = {
  id: string;
  numero: string;
  estado: ContainerEstado;
  proveedorId: string;
  puertoOrigen: string;
  puertoDestino: string;
  fechaSalida: string | null;
  fechaArriboEstimada: string | null;
  fechaArriboReal: string | null;
  costoTotal: string | null;
  contenidoResumen: string | null;
  notas: string | null;
  proveedor: { id: string; nombre: string; pais: string; ciudad: string | null };
  productos: ProductoResumen[];
  historialEstados: HistorialEstado[];
};

type Proveedor = { id: string; nombre: string; pais: string };

const ESTADO_LABELS: Record<ContainerEstado, string> = {
  en_preparacion: "En preparación",
  en_transito:    "En tránsito",
  en_aduana:      "En aduana",
  liberado:       "Liberado",
  descargado:     "Descargado",
};

const ESTADOS_FLUJO: ContainerEstado[] = [
  "en_preparacion",
  "en_transito",
  "en_aduana",
  "liberado",
  "descargado",
];

function formatFecha(iso: string | null, short = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", short
    ? { day: "2-digit", month: "short", year: "numeric" }
    : { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
  );
}

async function getContainer(id: string): Promise<ContainerDetalle | null> {
  try {
    return await apiFetch<ContainerDetalle>(`/api/containers/${id}`);
  } catch {
    return null;
  }
}

async function getProveedores(): Promise<Proveedor[]> {
  try {
    return await apiFetch<Proveedor[]>("/api/proveedores");
  } catch {
    return [];
  }
}

export default async function ContainerDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [container, proveedores] = await Promise.all([
    getContainer(id),
    getProveedores(),
  ]);

  if (!container) notFound();

  const estadoIndex = ESTADOS_FLUJO.indexOf(container.estado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/containers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Containers
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900 font-mono">
                {container.numero}
              </h1>
              <StatusBadge
                status={container.estado}
                label={ESTADO_LABELS[container.estado]}
                dot
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {container.puertoOrigen} → {container.puertoDestino}
              <span className="mx-1 text-gray-300">·</span>
              <Link
                href={`/proveedores/${container.proveedor.id}`}
                className="hover:underline text-gray-600"
              >
                {container.proveedor.nombre}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar de estados */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between relative">
          {/* Línea de fondo */}
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 mx-6" />
          {/* Línea de progreso */}
          <div
            className="absolute left-6 top-4 h-0.5 bg-emerald-400 transition-all"
            style={{
              width: `calc(${(estadoIndex / (ESTADOS_FLUJO.length - 1)) * 100}% - 1.5rem)`,
            }}
          />

          {ESTADOS_FLUJO.map((estado, i) => {
            const done = i < estadoIndex;
            const current = i === estadoIndex;
            return (
              <div key={estado} className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? "bg-emerald-500 border-emerald-500"
                      : current
                      ? "bg-white border-emerald-500 shadow-md"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {done ? (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${current ? "bg-emerald-500" : "bg-gray-200"}`} />
                  )}
                </div>
                <span className={`text-xs font-medium text-center leading-tight max-w-[80px] ${current ? "text-gray-900" : done ? "text-gray-400" : "text-gray-300"}`}>
                  {ESTADO_LABELS[estado]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Datos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Salida", value: formatFecha(container.fechaSalida, true), icon: Calendar },
          { label: "Arribo estimado", value: formatFecha(container.fechaArriboEstimada, true), icon: Calendar },
          { label: "Arribo real", value: formatFecha(container.fechaArriboReal, true), icon: Calendar },
          { label: "Costo total", value: container.costoTotal ? `USD ${Number(container.costoTotal).toLocaleString()}` : "—", icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
              <Icon className="h-3 w-3" />
              {label}
            </p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          {container.productos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Package className="h-4 w-4 text-gray-400" />
                Productos ({container.productos.length})
              </h2>
              <ul className="divide-y divide-gray-50">
                {container.productos.map((p) => (
                  <li key={p.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/productos/${p.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {p.nombre}
                      </Link>
                      <span className="font-mono text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-1.5">
                        {p.sku}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      Stock: <span className="font-medium text-gray-600">{p.stockActual}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formulario edición */}
          <ContainerForm
            containerId={container.id}
            proveedores={proveedores}
            defaultValues={{
              numero: container.numero,
              proveedorId: container.proveedorId,
              puertoOrigen: container.puertoOrigen,
              puertoDestino: container.puertoDestino,
              fechaSalida: container.fechaSalida?.slice(0, 10) ?? "",
              fechaArriboEstimada: container.fechaArriboEstimada?.slice(0, 10) ?? "",
              costoTotal: container.costoTotal ?? "",
              contenidoResumen: container.contenidoResumen ?? "",
              notas: container.notas ?? "",
            }}
          />
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Cambiar estado */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Actualizar estado
            </h2>
            <CambiarEstado
              containerId={container.id}
              estadoActual={container.estado}
            />
          </div>

          {/* Historial */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">
              Historial de estados
            </h2>
            {container.historialEstados.length === 0 ? (
              <p className="text-sm text-gray-400">Sin historial.</p>
            ) : (
              <ol className="space-y-4">
                {container.historialEstados.map((h, i) => (
                  <li key={h.id} className="flex gap-3">
                    {/* Línea y dot */}
                    <div className="flex flex-col items-center">
                      <div className={`h-2 w-2 rounded-full mt-1 shrink-0 ${i === 0 ? "bg-emerald-500" : "bg-gray-300"}`} />
                      {i < container.historialEstados.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 mt-1" />
                      )}
                    </div>
                    <div className="pb-4 min-w-0">
                      <StatusBadge
                        status={h.estado}
                        label={ESTADO_LABELS[h.estado]}
                      />
                      {h.nota && (
                        <p className="text-xs text-gray-500 mt-1">{h.nota}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatFecha(h.fecha)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
