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

type ProveedorResumen = { id: string; nombre: string; pais: string };

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
  inventario: {
    stockDisponible: number;
    stockEnTransito: number;
    stockMinimo: number;
  } | null;
  proveedor: ProveedorResumen | null;
};

type ContainerDetalle = {
  id: string;
  numero: string;
  estado: ContainerEstado;
  puertoOrigen: string;
  puertoDestino: string;
  fechaSalida: string | null;
  fechaArriboEstimada: string | null;
  fechaArriboReal: string | null;
  costoTotal: string | null;
  contenidoResumen: string | null;
  notas: string | null;
  proveedores: ProveedorResumen[];
  productos: ProductoResumen[];
  historialEstados: HistorialEstado[];
};

const ESTADO_LABELS: Record<ContainerEstado, string> = {
  en_preparacion: "En preparacion",
  en_transito: "En transito",
  en_aduana: "En aduana",
  liberado: "Liberado",
  descargado: "Descargado",
};

const ESTADO_BADGE: Record<ContainerEstado, string> = {
  en_preparacion: "bg-gray-100 text-gray-500 border-gray-200",
  en_transito: "bg-blue-50 text-blue-700 border-blue-200",
  en_aduana: "bg-amber-50 text-amber-700 border-amber-200",
  liberado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  descargado: "bg-gray-100 text-gray-500 border-gray-200",
};

const ESTADOS_FLUJO: ContainerEstado[] = [
  "en_preparacion",
  "en_transito",
  "en_aduana",
  "liberado",
  "descargado",
];

function formatFecha(iso: string | null, short = false) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString(
    "es-CL",
    short
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

export default async function ContainerDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const container = await getContainer(id);

  if (!container) notFound();

  const estadoIndex = ESTADOS_FLUJO.indexOf(container.estado);

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div>
        <Link
          href="/containers"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Containers
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold text-gray-900">
            {container.numero}
          </h1>
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
              ESTADO_BADGE[container.estado],
            ].join(" ")}
          >
            {ESTADO_LABELS[container.estado]}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {container.puertoOrigen} / {container.puertoDestino} ·{" "}
          {container.proveedores.length > 0
            ? container.proveedores.map((proveedor, index) => (
                <span key={proveedor.id}>
                  {index > 0 && ", "}
                  <Link href={`/proveedores/${proveedor.id}`} className="hover:text-blue-600">
                    {proveedor.nombre}
                  </Link>
                </span>
              ))
            : "Sin proveedores asociados"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <div className="relative flex min-w-[560px] items-start justify-between">
          <div className="absolute left-4 right-4 top-4 h-px bg-gray-200" />
          <div
            className="absolute left-4 top-4 h-px bg-blue-500 transition-all"
            style={{
              width:
                estadoIndex <= 0
                  ? "0%"
                  : `calc(${(estadoIndex / (ESTADOS_FLUJO.length - 1)) * 100}% - 2rem)`,
            }}
          />
          {ESTADOS_FLUJO.map((estado, i) => {
            const done = i < estadoIndex;
            const current = i === estadoIndex;
            return (
              <div key={estado} className="z-10 flex flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-all",
                    done ? "border-blue-500 bg-blue-500" : "",
                    current ? "border-blue-500 shadow-sm" : "",
                    !done && !current ? "border-gray-300" : "",
                  ].join(" ")}
                >
                  {done ? (
                    <span className="text-xs font-semibold text-white">✓</span>
                  ) : (
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        current ? "bg-blue-500" : "bg-gray-300",
                      ].join(" ")}
                    />
                  )}
                </div>
                <span
                  className={[
                    "max-w-[72px] text-center text-xs leading-tight",
                    current ? "font-medium text-gray-900" : done ? "text-gray-500" : "text-gray-400",
                  ].join(" ")}
                >
                  {ESTADO_LABELS[estado]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Salida", valor: formatFecha(container.fechaSalida, true) },
          { label: "Arribo estimado", valor: formatFecha(container.fechaArriboEstimada, true) },
          { label: "Arribo real", valor: formatFecha(container.fechaArriboReal, true) },
          {
            label: "Costo total",
            valor: container.costoTotal
              ? `USD ${Number(container.costoTotal).toLocaleString()}`
              : "-",
          },
        ].map(({ label, valor }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="mb-1 text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-900">{valor}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Productos ({container.productos.length})
            </h2>
            {container.productos.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aun no hay productos asociados a este container.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {container.productos.map((producto) => (
                  <li
                    key={producto.id}
                    className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Link
                        href={`/productos/${producto.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {producto.nombre}
                      </Link>
                      <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-400">
                        {producto.sku}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {producto.proveedor && (
                        <Link
                          href={`/proveedores/${producto.proveedor.id}`}
                          className="hover:text-blue-600"
                        >
                          {producto.proveedor.nombre}
                        </Link>
                      )}
                      <span>
                        Disponible:{" "}
                        <span className="font-medium text-gray-900">
                          {producto.inventario?.stockDisponible ?? 0}
                        </span>
                      </span>
                      <span>
                        Transito:{" "}
                        <span className="font-medium text-gray-900">
                          {producto.inventario?.stockEnTransito ?? 0}
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div id="editar">
            <ContainerForm
              containerId={container.id}
              defaultValues={{
                numero: container.numero,
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
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Actualizar estado</h2>
            <CambiarEstado containerId={container.id} estadoActual={container.estado} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="mb-5 text-sm font-semibold text-gray-900">Historial</h2>
            {container.historialEstados.length === 0 ? (
              <p className="text-sm text-gray-500">Sin historial.</p>
            ) : (
              <ol className="space-y-4">
                {container.historialEstados.map((historial, i) => (
                  <li key={historial.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={[
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          i === 0 ? "bg-blue-500" : "bg-gray-300",
                        ].join(" ")}
                      />
                      {i < container.historialEstados.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-gray-200" />
                      )}
                    </div>
                    <div className="min-w-0 pb-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                          ESTADO_BADGE[historial.estado],
                        ].join(" ")}
                      >
                        {ESTADO_LABELS[historial.estado]}
                      </span>
                      {historial.nota && (
                        <p className="mt-1 text-xs text-gray-500">{historial.nota}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {formatFecha(historial.fecha)}
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
