import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ProductForm } from "@/components/productos/ProductForm";
import type { ProductoOptions } from "@/components/productos/types";

async function getOptions(): Promise<ProductoOptions> {
  try {
    return await apiFetch<ProductoOptions>("/api/productos/opciones");
  } catch {
    return { categorias: [], proveedores: [], containers: [] };
  }
}

export default async function NuevoProductoPage() {
  const options = await getOptions();

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <Link
          href="/productos"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Productos
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo producto</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registra stock, precios, categoria, proveedor, container e imagenes.
        </p>
      </div>

      {options.categorias.length === 0 && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Debes crear al menos una categoria en la base antes de registrar productos.
        </p>
      )}

      <ProductForm options={options} />
    </div>
  );
}
