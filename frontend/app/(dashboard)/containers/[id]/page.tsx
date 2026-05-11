import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
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

const ESTADO_BADGE: Record<ContainerEstado, string> = {
  en_preparacion: "bg-gray-100 text-gray-500 border-gray-200",
  en_transito:    "bg-blue-50 text-blue-700 border-blue-200",
  en_aduana:      "bg-amber-50 text-amber-700 border-amber-200",
  liberado:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  descargado:     "bg-gray-100 text-gray-500 border-gray-200",
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
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb + título */}
      <div>
        <Link
          href="/containers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Containers
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 font-mono">
            {container.numero}
          </h1>
          <span className={[
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
            ESTADO_BADGE[container.estado],
          ].join(" ")}>
            {ESTADO_LABELS[container.estado]}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {container.puertoOrigen} → {container.puertoDestino} ·{" "}
          <Link href={`/proveedores/${container.proveedor.id}`} className="hover:text-blue-600">
            {container.proveedor.nombre}
          </Link>
        </p>
      </div>

      {/* Progress bar de estados */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-start justify-between relative">
          <div className="absolute left-4 right-4 top-4 h-px bg-gray-200" />
          <div
            className="absolute left-4 top-4 h-px bg-blue-500 transition-all"
            style={{
              width: estadoIndex === 0
                ? "0%"
                : `calc(${(estadoIndex / (ESTADOS_FLUJO.length - 1)) * 100}% - 2rem)`,
            }}
          />
          {ESTADOS_FLUJO.map((estado, i) => {
            const done    = i < estadoIndex;
            const current = i === estadoIndex;
            return (
              <div key={estado} className="flex flex-col items-center gap-2 z-10">
                <div className={[
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center bg-white transition-all",
                  done    ? "border-blue-500 bg-blue-500" : "",
                  current ? "border-blue-500 shadow-sm"   : "",
                  !done && !current ? "border-gray-300"   : "",
                ].join(" ")}>
                  {done ? (
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={["h-2 w-2 rounded-full", current ? "bg-blue-500" : "bg-gray-300"].join(" ")} />
                  )}
                </div>
                <span className={[
                  "text-xs text-center leading-tight max-w-[72px]",
                  current ? "font-medium text-gray-900" : done ? "text-gray-500" : "text-gray-400",
                ].join(" ")}>
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
          { label: "Salida",          valor: formatFecha(container.fechaSalida, true) },
          { label: "Arribo estimado", valor: formatFecha(container.fechaArriboEstimada, true) },
          { label: "Arribo real",     valor: formatFecha(container.fechaArriboReal, true) },
          { label: "Costo total",     valor: container.costoTotal ? `USD ${Number(container.costoTotal).toLocaleString()}` : "—" },
        ].map(({ label, valor }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-gray-900">{valor}</p>
          </div>
        ))}
      </div>

      {/* Layout 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {container.productos.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Productos ({container.productos.length})
              </h2>
              <ul className="divide-y divide-gray-200">
                {container.productos.map((p) => (
                  <li key={p.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/productos/${p.id}`}
                        className="text-sm text-gray-900 hover:text-blue-600 font-medium"
                      >
                        {p.nombre}
                      </Link>
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                        {p.sku}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Stock: <span className="font-medium text-gray-900">{p.stockActual}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Actualizar estado</h2>
            <CambiarEstado containerId={container.id} estadoActual={container.estado} />
          </div>

          {/* Historial */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">Historial</h2>
            {container.historialEstados.length === 0 ? (
              <p className="text-sm text-gray-500">Sin historial.</p>
            ) : (
              <ol className="space-y-4">
                {container.historialEstados.map((h, i) => (
                  <li key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={[
                        "h-2 w-2 rounded-full mt-1.5 shrink-0",
                        i === 0 ? "bg-blue-500" : "bg-gray-300",
                      ].join(" ")} />
                      {i < container.historialEstados.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-4 min-w-0">
                      <span className={[
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                        ESTADO_BADGE[h.estado],
                      ].join(" ")}>
                        {ESTADO_LABELS[h.estado]}
                      </span>
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
