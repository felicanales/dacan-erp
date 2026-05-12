"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { Eye, Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Producto = { id: string; nombre: string; sku: string; estado: string };

type ContainerResumen = {
  id: string;
  numero: string;
  estado: string;
  fechaArriboEstimada: string | null;
};

type ProveedorDetalle = {
  id: string;
  nombre: string;
  pais: string;
  ciudad: string | null;
  contactoNombre: string | null;
  contactoEmail: string | null;
  contactoTelefono: string | null;
  moneda: string;
  condicionesPago: string | null;
  notas: string | null;
  activo: boolean;
  productos: Producto[];
  containers: ContainerResumen[];
};

type ProveedorActionsProps = {
  proveedorId: string;
  proveedorNombre: string;
  canDelete: boolean;
};

const ESTADO_CONTAINER: Record<string, string> = {
  en_preparacion: "En preparacion",
  en_transito: "En transito",
  en_aduana: "En aduana",
  liberado: "Liberado",
  descargado: "Descargado",
};

export function ProveedorActions({
  proveedorId,
  proveedorNombre,
  canDelete,
}: ProveedorActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<ProveedorDetalle | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function handleView() {
    setOpen(true);

    if (detail || loadingDetail) return;

    setLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/proveedores/${proveedorId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al cargar proveedor");
      }
      setDetail((await res.json()) as ProveedorDetalle);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Error al cargar proveedor");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Eliminar proveedor "${proveedorNombre}"? Esta accion no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/proveedores/${proveedorId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al eliminar proveedor");
      }
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Error al eliminar proveedor");
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
          aria-label="Editar proveedor"
        >
          <Link href={`/proveedores/${proveedorId}#editar`}>
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
          title={canDelete ? "Eliminar proveedor" : "No se puede eliminar con productos o containers asociados"}
          aria-label="Eliminar proveedor"
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
            aria-labelledby={`proveedor-${proveedorId}-title`}
            className="relative max-h-[86dvh] w-full max-w-3xl animate-in slide-in-from-bottom-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl duration-200"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Informacion completa
                </p>
                <h2
                  id={`proveedor-${proveedorId}-title`}
                  className="mt-1 truncate text-lg font-semibold text-gray-900"
                >
                  {detail?.nombre ?? proveedorNombre}
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
                    <InfoItem label="Estado" value={detail.activo ? "Activo" : "Inactivo"} />
                    <InfoItem label="Pais / Ciudad" value={`${detail.pais}${detail.ciudad ? ` / ${detail.ciudad}` : ""}`} />
                    <InfoItem label="Contacto" value={detail.contactoNombre} />
                    <InfoItem label="Correo" value={detail.contactoEmail} />
                    <InfoItem label="Telefono / WhatsApp" value={detail.contactoTelefono} />
                    <InfoItem label="Moneda" value={detail.moneda} />
                    <InfoItem
                      label="Condiciones de pago"
                      value={detail.condicionesPago}
                      className="sm:col-span-2"
                    />
                    <InfoItem label="Notas" value={detail.notas} className="sm:col-span-2" />
                  </dl>

                  <RelatedList
                    title={`Containers (${detail.containers.length})`}
                    empty="Sin containers asociados."
                  >
                    {detail.containers.map((container) => (
                      <li
                        key={container.id}
                        className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <Link
                          href={`/containers/${container.id}`}
                          className="font-mono text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {container.numero}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {ESTADO_CONTAINER[container.estado] ?? container.estado}
                          {container.fechaArriboEstimada
                            ? ` / ${new Date(container.fechaArriboEstimada).toLocaleDateString("es-CL")}`
                            : ""}
                        </span>
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
                        <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                        <span className="font-mono text-xs text-gray-500">{producto.sku}</span>
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
