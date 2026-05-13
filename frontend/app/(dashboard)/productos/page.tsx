import Link from "next/link";
import { ImageIcon, PackagePlus } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductoEstado } from "@/components/productos/types";
import {
  formatCLP,
  formatUSD,
  getCoverImage,
  PRODUCTO_ESTADO_BADGE,
  PRODUCTO_ESTADO_LABELS,
  stockBadgeClass,
  stockLabel,
} from "@/components/productos/producto-utils";

type Producto = {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precioCosto: string;
  precioB2B: string;
  precioB2C: string;
  stockActual: number;
  stockMinimo: number;
  fotos: string[];
  fotoPortada: string | null;
  estado: ProductoEstado;
  categoria: { id: string; nombre: string };
  proveedor: { id: string; nombre: string; pais: string } | null;
  container: { id: string; numero: string; estado: string } | null;
};

async function getProductos(): Promise<Producto[]> {
  try {
    return await apiFetch<Producto[]>("/api/productos");
  } catch {
    return [];
  }
}

export default async function ProductosPage() {
  const productos = await getProductos();
  const disponibles = productos.filter((producto) => producto.estado === "disponible").length;
  const stockBajo = productos.filter(
    (producto) => producto.stockActual <= producto.stockMinimo
  ).length;
  const categorias = new Set(productos.map((producto) => producto.categoria.id)).size;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Catalogo de productos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vista de tienda con estado, stock, precios, categoria y origen.
          </p>
        </div>
        <Link
          href="/productos/nuevo"
          className={cn(
            buttonVariants(),
            "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
          )}
        >
          + Nuevo producto
        </Link>
      </div>

      {productos.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { label: "Productos", valor: productos.length },
            { label: "Disponibles", valor: disponibles },
            { label: "Stock bajo", valor: stockBajo },
            { label: "Categorias", valor: categorias },
          ].map(({ label, valor }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-3xl font-bold text-gray-900">{valor}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center sm:py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <PackagePlus className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">No hay productos aun</p>
          <p className="mt-1 text-sm text-gray-500">
            Crea el primer producto del catalogo.
          </p>
          <Link
            href="/productos/nuevo"
            className={cn(
              buttonVariants(),
              "mt-4 h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
            )}
          >
            + Nuevo producto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {productos.map((producto) => {
            const cover = getCoverImage(producto.fotos, producto.fotoPortada);
            return (
              <Link
                key={producto.id}
                href={`/productos/${producto.id}`}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-blue-200 hover:bg-gray-50"
              >
                <div className="relative aspect-[4/3] bg-gray-50">
                  {cover ? (
                    <img
                      src={cover}
                      alt={producto.nombre}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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
                        stockBadgeClass(producto.stockActual, producto.stockMinimo)
                      )}
                    >
                      {stockLabel(producto.stockActual, producto.stockMinimo)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                        {producto.nombre}
                      </h2>
                      <span className="shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                        {producto.sku}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{producto.categoria.nombre}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">B2C</p>
                      <p className="mt-0.5 font-medium text-gray-900">{formatCLP(producto.precioB2C)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">B2B</p>
                      <p className="mt-0.5 font-medium text-gray-900">{formatCLP(producto.precioB2B)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Stock</p>
                      <p className="mt-0.5 font-medium text-gray-900">{producto.stockActual}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs">
                    <div>
                      <p className="text-gray-400">Costo</p>
                      <p className="mt-0.5 font-medium text-gray-700">{formatUSD(producto.precioCosto)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Proveedor</p>
                      <p className="mt-0.5 truncate font-medium text-gray-700">
                        {producto.proveedor?.nombre ?? "Sin proveedor"}
                      </p>
                    </div>
                    {producto.container && (
                      <div className="col-span-2">
                        <p className="text-gray-400">Container</p>
                        <p className="mt-0.5 font-mono font-medium text-gray-700">
                          {producto.container.numero}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
