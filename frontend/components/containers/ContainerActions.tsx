"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { Eye, Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProveedorResumen = { id: string; nombre: string; pais: string };

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

type HistorialEstado = {
  id: string;
  estado: string;
  nota: string | null;
  fecha: string;
};

type ContainerDetalle = {
  id: string;
  numero: string;
  estado: string;
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

type ContainerActionsProps = {
  containerId: string;
  containerNumero: string;
  canDelete: boolean;
};

const ESTADO_CONTAINER: Record<string, string> = {
  en_preparacion: "En preparacion",
  en_transito: "En transito",
  en_aduana: "En aduana",
  liberado: "Liberado",
  descargado: "Descargado",
};

function formatFecha(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ContainerActions({
  containerId,
  containerNumero,
  canDelete,
}: ContainerActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<ContainerDetalle | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function handleView() {
    setOpen(true);

    if (detail || loadingDetail) return;

    setLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/containers/${containerId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al cargar container");
      }
      setDetail((await res.json()) as ContainerDetalle);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Error al cargar container");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Eliminar container "${containerNumero}"? Esta accion no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/containers/${containerId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al eliminar container");
      }
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Error al eliminar container");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-gray-200 text-gray-600 hover:text-gray-900"
          onClick={handleView}
          aria-label="Ver informacion completa"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          asChild
          variant="outline"
          size="icon-sm"
          className="border-gray-200 text-gray-600 hover:text-gray-900"
          aria-label="Editar container"
        >
          <Link href={`/containers/${containerId}#editar`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          title={canDelete ? "Eliminar container" : "No se puede eliminar con productos asociados"}
          aria-label="Eliminar container"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-3 pb-3 pt-12 sm:px-6 sm:pb-6">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar informacion"
            onClick={() => setOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`container-${containerId}-title`}
            className="relative max-h-[86dvh] w-full max-w-3xl animate-in slide-in-from-bottom-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl duration-200"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Informacion completa
                </p>
                <h2
                  id={`container-${containerId}-title`}
                  className="mt-1 truncate font-mono text-lg font-semibold text-gray-900"
                >
                  {detail?.numero ?? containerNumero}
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[calc(86dvh-5rem)] overflow-y-auto px-4 py-4 sm:px-5">
              {loadingDetail && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando informacion...
                </div>
              )}

              {detailError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {detailError}
                </p>
              )}

              {detail && (
                <div className="space-y-5">
                  <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <InfoItem label="Estado" value={ESTADO_CONTAINER[detail.estado] ?? detail.estado} />
                    <InfoItem label="Ruta" value={`${detail.puertoOrigen} / ${detail.puertoDestino}`} />
                    <InfoItem label="Salida" value={formatFecha(detail.fechaSalida)} />
                    <InfoItem label="Arribo estimado" value={formatFecha(detail.fechaArriboEstimada)} />
                    <InfoItem label="Arribo real" value={formatFecha(detail.fechaArriboReal)} />
                    <InfoItem
                      label="Costo total"
                      value={detail.costoTotal ? `USD ${Number(detail.costoTotal).toLocaleString()}` : "-"}
                    />
                    <InfoItem
                      label="Resumen del contenido"
                      value={detail.contenidoResumen}
                      className="sm:col-span-2"
                    />
                    <InfoItem label="Notas" value={detail.notas} className="sm:col-span-2" />
                  </dl>

                  <RelatedList
                    title={`Proveedores (${detail.proveedores.length})`}
                    empty="Sin proveedores asociados."
                  >
                    {detail.proveedores.map((proveedor) => (
                      <li
                        key={proveedor.id}
                        className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <Link
                          href={`/proveedores/${proveedor.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {proveedor.nombre}
                        </Link>
                        <span className="text-xs text-gray-500">{proveedor.pais}</span>
                      </li>
                    ))}
                  </RelatedList>

                  <RelatedList
                    title={`Productos (${detail.productos.length})`}
                    empty="Sin productos asociados."
                  >
                    {detail.productos.map((producto) => (
                      <li
                        key={producto.id}
                        className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </span>
                          <span className="font-mono text-xs text-gray-500">{producto.sku}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {producto.proveedor?.nombre ?? "Sin proveedor"} / Disp.{" "}
                          {producto.inventario?.stockDisponible ?? 0} / Trans.{" "}
                          {producto.inventario?.stockEnTransito ?? 0}
                        </span>
                      </li>
                    ))}
                  </RelatedList>

                  <RelatedList
                    title={`Historial (${detail.historialEstados.length})`}
                    empty="Sin historial."
                  >
                    {detail.historialEstados.map((historial) => (
                      <li key={historial.id} className="py-2.5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {ESTADO_CONTAINER[historial.estado] ?? historial.estado}
                          </span>
                          <span className="text-xs text-gray-500">{formatFecha(historial.fecha)}</span>
                        </div>
                        {historial.nota && (
                          <p className="mt-1 text-xs text-gray-500">{historial.nota}</p>
                        )}
                      </li>
                    ))}
                  </RelatedList>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-gray-900">{value || "-"}</dd>
    </div>
  );
}

function RelatedList({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode[];
}) {
  return (
    <div className="rounded-lg border border-gray-200">
      <h3 className="border-b border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900">
        {title}
      </h3>
      {children.length > 0 ? (
        <ul className="divide-y divide-gray-200 px-3">{children}</ul>
      ) : (
        <p className="px-3 py-3 text-sm text-gray-500">{empty}</p>
      )}
    </div>
  );
}
