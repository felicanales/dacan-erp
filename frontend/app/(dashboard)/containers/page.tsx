import Link from "next/link";
import { Package } from "lucide-react";
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
import { ContainerActions } from "@/components/containers/ContainerActions";

type ProveedorResumen = {
  id: string;
  nombre: string;
  pais: string;
};

type Container = {
  id: string;
  numero: string;
  estado: string;
  puertoOrigen: string;
  puertoDestino: string;
  fechaSalida: string | null;
  fechaArriboEstimada: string | null;
  fechaArriboReal: string | null;
  proveedores: ProveedorResumen[];
  _count: { productos: number };
};

const ESTADO_LABELS: Record<string, string> = {
  en_preparacion: "En preparacion",
  en_transito: "En transito",
  en_aduana: "En aduana",
  liberado: "Liberado",
  descargado: "Descargado",
};

const ESTADO_BADGE: Record<string, string> = {
  en_preparacion: "bg-gray-100 text-gray-500 border-gray-200",
  en_transito: "bg-blue-50 text-blue-700 border-blue-200",
  en_aduana: "bg-amber-50 text-amber-700 border-amber-200",
  liberado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  descargado: "bg-gray-100 text-gray-500 border-gray-200",
};

const ESTADO_DOT: Record<string, string> = {
  en_preparacion: "bg-gray-400",
  en_transito: "bg-blue-500",
  en_aduana: "bg-amber-500",
  liberado: "bg-emerald-500",
  descargado: "bg-gray-400",
};

const ESTADOS_FLUJO = [
  "en_preparacion",
  "en_transito",
  "en_aduana",
  "liberado",
  "descargado",
] as const;

function formatFecha(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatProveedores(proveedores: ProveedorResumen[]) {
  if (proveedores.length === 0) return "Sin proveedores";
  return proveedores.map((proveedor) => proveedor.nombre).join(", ");
}

function formatPaises(proveedores: ProveedorResumen[]) {
  return [...new Set(proveedores.map((proveedor) => proveedor.pais))].join(", ");
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
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Containers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Seguimiento de envios internacionales
          </p>
        </div>
        <Link
          href="/containers/nuevo"
          className={cn(
            buttonVariants(),
            "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
          )}
        >
          + Nuevo container
        </Link>
      </div>

      {containers.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ESTADOS_FLUJO.map((estado) => (
            <div
              key={estado}
              className="rounded-lg border border-gray-200 bg-white p-3 text-center sm:p-4"
            >
              <p className="text-2xl font-bold text-gray-900">
                {countByEstado[estado] ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">{ESTADO_LABELS[estado]}</p>
            </div>
          ))}
        </div>
      )}

      {containers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center sm:py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <Package className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">No hay containers aun</p>
          <p className="mt-1 text-sm text-gray-500">
            Registra un container para hacer seguimiento del envio.
          </p>
          <Link
            href="/containers/nuevo"
            className={cn(
              buttonVariants(),
              "mt-4 h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
            )}
          >
            + Nuevo container
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-900">{activos}</span>{" "}
                activo{activos !== 1 ? "s" : ""} -{" "}
                <span className="font-semibold text-gray-900">
                  {containers.length}
                </span>{" "}
                total
              </p>
            </div>
            {containers.map((c) => (
              <article
                key={c.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/containers/${c.id}`}
                      className="block truncate font-mono text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {c.numero}
                    </Link>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {formatProveedores(c.proveedores)}
                    </p>
                    {c.proveedores.length > 0 && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {formatPaises(c.proveedores)}
                      </p>
                    )}
                  </div>
                  <span
                    className={[
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                      ESTADO_BADGE[c.estado] ??
                        "bg-gray-100 text-gray-500 border-gray-200",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        ESTADO_DOT[c.estado] ?? "bg-gray-400",
                      ].join(" ")}
                    />
                    {ESTADO_LABELS[c.estado] ?? c.estado}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Ruta</p>
                    <p className="mt-0.5 text-gray-900">
                      {c.puertoOrigen} / {c.puertoDestino}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Arribo</p>
                    <p className="mt-0.5 text-gray-900">
                      {formatFecha(c.fechaArriboReal ?? c.fechaArriboEstimada)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Salida</p>
                    <p className="mt-0.5 text-gray-900">{formatFecha(c.fechaSalida)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Productos</p>
                    <p className="mt-0.5 text-gray-900">{c._count.productos}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <ContainerActions
                    containerId={c.id}
                    containerNumero={c.numero}
                    canDelete={c._count.productos === 0}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
            <div className="border-b border-gray-200 px-4 py-2.5">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-900">{activos}</span>{" "}
                activo{activos !== 1 ? "s" : ""} -{" "}
                <span className="font-semibold text-gray-900">
                  {containers.length}
                </span>{" "}
                total
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  {[
                    "Container",
                    "Proveedores",
                    "Ruta",
                    "Salida",
                    "Arribo",
                    "Productos",
                    "Estado",
                    "Acciones",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="px-4 py-3">
                      <Link
                        href={`/containers/${c.id}`}
                        className="font-mono text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
                      >
                        {c.numero}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {c.proveedores.length > 0 ? (
                        <div className="max-w-64 space-y-0.5">
                          {c.proveedores.slice(0, 2).map((proveedor) => (
                            <Link
                              key={proveedor.id}
                              href={`/proveedores/${proveedor.id}`}
                              className="block truncate text-sm text-gray-900 hover:text-blue-600"
                            >
                              {proveedor.nombre}
                            </Link>
                          ))}
                          {c.proveedores.length > 2 && (
                            <span className="block text-xs text-gray-500">
                              +{c.proveedores.length - 2} mas
                            </span>
                          )}
                          <span className="block truncate text-xs text-gray-500">
                            {formatPaises(c.proveedores)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin proveedores</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {c.puertoOrigen}
                        <span className="mx-1.5 text-gray-400">-&gt;</span>
                        {c.puertoDestino}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500">
                      {formatFecha(c.fechaSalida)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      {c.fechaArriboReal ? (
                        <span className="font-medium text-emerald-700">
                          {formatFecha(c.fechaArriboReal)}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {formatFecha(c.fechaArriboEstimada)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-900">
                        {c._count.productos}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                          ESTADO_BADGE[c.estado] ??
                            "bg-gray-100 text-gray-500 border-gray-200",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            ESTADO_DOT[c.estado] ?? "bg-gray-400",
                          ].join(" ")}
                        />
                        {ESTADO_LABELS[c.estado] ?? c.estado}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <ContainerActions
                        containerId={c.id}
                        containerNumero={c.numero}
                        canDelete={c._count.productos === 0}
                      />
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
