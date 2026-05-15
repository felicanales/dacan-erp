import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ProductActions } from "@/components/productos/ProductActions";
import { ProductForm } from "@/components/productos/ProductForm";
import { ProductGallery } from "@/components/productos/ProductGallery";
import { InventoryMovementForm } from "@/components/productos/InventoryMovementForm";
import type {
  InventarioMovimientoTipo,
  ProductoEstado,
  ProductoFormValues,
  ProductoOptions,
} from "@/components/productos/types";
import {
  formatCLP,
  formatUSD,
  MOVIMIENTO_LABELS,
  PRODUCTO_ESTADO_BADGE,
  PRODUCTO_ESTADO_LABELS,
  stockBadgeClass,
  stockLabel,
} from "@/components/productos/producto-utils";

type ProductoDetalle = {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoriaId: string;
  precioCosto: string;
  precioB2B: string;
  precioB2C: string;
  proveedorId: string | null;
  containerId: string | null;
  fotos: string[];
  fotoPortada: string | null;
  estado: ProductoEstado;
  notas: string | null;
  archivadoAt: string | null;
  archivadoMotivo: string | null;
  categoria: { id: string; nombre: string; descripcion: string | null };
  proveedor: {
    id: string;
    nombre: string;
    pais: string;
    ciudad: string | null;
    contactoNombre: string | null;
    contactoEmail: string | null;
  } | null;
  container: {
    id: string;
    numero: string;
    estado: string;
    fechaArriboEstimada: string | null;
    puertoOrigen: string;
    puertoDestino: string;
  } | null;
  inventario: {
    id: string;
    stockDisponible: number;
    stockEnTransito: number;
    stockMinimo: number;
    ubicacion: string | null;
    updatedAt: string;
    movimientos: {
      id: string;
      tipo: InventarioMovimientoTipo;
      cantidad: number;
      stockDisponibleAntes: number;
      stockDisponibleDespues: number;
      stockEnTransitoAntes: number;
      stockEnTransitoDespues: number;
      nota: string | null;
      createdAt: string;
      container: { id: string; numero: string } | null;
    }[];
  } | null;
  _count: { itemsPedido: number; movimientosInventario: number };
};

async function getProducto(id: string): Promise<ProductoDetalle | null> {
  try {
    return await apiFetch<ProductoDetalle>(`/api/productos/${id}`);
  } catch {
    return null;
  }
}

async function getOptions(): Promise<ProductoOptions> {
  try {
    return await apiFetch<ProductoOptions>("/api/productos/opciones");
  } catch {
    return { categorias: [], proveedores: [], containers: [] };
  }
}

function toFormValues(producto: ProductoDetalle): Partial<ProductoFormValues> {
  return {
    sku: producto.sku,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? "",
    categoriaId: producto.categoriaId,
    precioCosto: String(producto.precioCosto),
    precioB2B: String(producto.precioB2B),
    precioB2C: String(producto.precioB2C),
    stockDisponible: String(producto.inventario?.stockDisponible ?? 0),
    stockEnTransito: String(producto.inventario?.stockEnTransito ?? 0),
    stockMinimo: String(producto.inventario?.stockMinimo ?? 5),
    ubicacion: producto.inventario?.ubicacion ?? "",
    proveedorId: producto.proveedorId ?? "",
    containerId: producto.containerId ?? "",
    fotos: producto.fotos,
    fotoPortada: producto.fotoPortada ?? producto.fotos[0] ?? "",
    notas: producto.notas ?? "",
  };
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? "-"}</dd>
    </div>
  );
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, options] = await Promise.all([getProducto(id), getOptions()]);

  if (!producto) notFound();

  const stockDisponible = producto.inventario?.stockDisponible ?? 0;
  const stockEnTransito = producto.inventario?.stockEnTransito ?? 0;
  const stockMinimo = producto.inventario?.stockMinimo ?? 0;

  return (
    <div className="w-full max-w-7xl space-y-8">
      <div>
        <Link
          href="/productos"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Productos
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                  PRODUCTO_ESTADO_BADGE[producto.estado]
                )}
              >
                {PRODUCTO_ESTADO_LABELS[producto.estado]}
              </span>
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                  stockBadgeClass(stockDisponible, stockMinimo)
                )}
              >
                {stockLabel(stockDisponible, stockMinimo)}
              </span>
              {producto.archivadoAt && (
                <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  Archivado
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">{producto.nombre}</h1>
            <p className="mt-1 font-mono text-sm text-gray-500">{producto.sku}</p>
          </div>
          <ProductActions
            productoId={producto.id}
            productoNombre={producto.nombre}
            archivado={Boolean(producto.archivadoAt)}
          />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <ProductGallery
          fotos={producto.fotos}
          fotoPortada={producto.fotoPortada}
          nombre={producto.nombre}
        />

        <div className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-900">Precios</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">B2C</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCLP(producto.precioB2C)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">B2B</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCLP(producto.precioB2B)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Costo</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatUSD(producto.precioCosto)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-900">Informacion comercial</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Categoria" value={producto.categoria.nombre} />
              <InfoItem label="Stock disponible" value={stockDisponible} />
              <InfoItem label="Stock en transito" value={stockEnTransito} />
              <InfoItem label="Stock minimo" value={stockMinimo} />
              <InfoItem
                label="Ubicacion inventario"
                value={producto.inventario?.ubicacion ?? "-"}
              />
              <InfoItem
                label="Proveedor"
                value={
                  producto.proveedor ? (
                    <Link href={`/proveedores/${producto.proveedor.id}`} className="hover:text-blue-600">
                      {producto.proveedor.nombre}
                    </Link>
                  ) : (
                    "Sin proveedor"
                  )
                }
              />
              <InfoItem
                label="Container"
                value={
                  producto.container ? (
                    <Link
                      href={`/containers/${producto.container.id}`}
                      className="font-mono hover:text-blue-600"
                    >
                      {producto.container.numero}
                    </Link>
                  ) : (
                    "Sin container"
                  )
                }
              />
            </dl>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Descripcion</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {producto.descripcion || "Sin descripcion."}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Notas internas</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {producto.notas || "Sin notas internas."}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(360px,0.75fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Movimiento de inventario</h2>
          <p className="mt-1 text-xs text-gray-500">
            Todo cambio de stock queda registrado en el historial.
          </p>
          <div className="mt-4">
            <InventoryMovementForm
              productoId={producto.id}
              stockDisponible={stockDisponible}
              stockEnTransito={stockEnTransito}
              containerId={producto.containerId}
              disabled={Boolean(producto.archivadoAt)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Historial de inventario</h2>
          {producto.inventario?.movimientos.length ? (
            <ol className="mt-4 divide-y divide-gray-200">
              {producto.inventario.movimientos.map((movimiento) => (
                <li key={movimiento.id} className="py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {MOVIMIENTO_LABELS[movimiento.tipo]}
                        <span className="ml-2 font-mono text-xs text-gray-500">
                          {movimiento.cantidad > 0 ? "+" : ""}
                          {movimiento.cantidad}
                        </span>
                      </p>
                      {movimiento.container && (
                        <Link
                          href={`/containers/${movimiento.container.id}`}
                          className="mt-0.5 inline-block font-mono text-xs text-gray-500 hover:text-blue-600"
                        >
                          {movimiento.container.numero}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(movimiento.createdAt).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <span>
                      Disponible: {movimiento.stockDisponibleAntes} /{" "}
                      <strong className="font-medium text-gray-900">
                        {movimiento.stockDisponibleDespues}
                      </strong>
                    </span>
                    <span>
                      Transito: {movimiento.stockEnTransitoAntes} /{" "}
                      <strong className="font-medium text-gray-900">
                        {movimiento.stockEnTransitoDespues}
                      </strong>
                    </span>
                  </div>
                  {movimiento.nota && (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-gray-500">
                      {movimiento.nota}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Sin movimientos registrados.</p>
          )}
        </div>
      </section>

      <section id="editar" className="space-y-3">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Editar producto</h2>
          <p className="mt-1 text-sm text-gray-500">
            Actualiza datos, proveedor, container, stock, precios e imagenes.
          </p>
        </div>
        <ProductForm
          productoId={producto.id}
          options={options}
          defaultValues={toFormValues(producto)}
        />
      </section>
    </div>
  );
}
