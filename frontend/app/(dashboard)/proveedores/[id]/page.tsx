import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { ProveedorForm } from "@/components/proveedores/ProveedorForm";

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

const ESTADOS_CONTAINER: Record<string, string> = {
  en_preparacion: "En preparación",
  en_transito: "En tránsito",
  en_aduana: "En aduana",
  liberado: "Liberado",
  descargado: "Descargado",
};

async function getProveedor(id: string): Promise<ProveedorDetalle | null> {
  try {
    return await apiFetch<ProveedorDetalle>(`/api/proveedores/${id}`);
  } catch {
    return null;
  }
}

export default async function ProveedorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proveedor = await getProveedor(id);

  if (!proveedor) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/proveedores"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a proveedores
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{proveedor.nombre}</h1>
          <Badge variant={proveedor.activo ? "default" : "secondary"}>
            {proveedor.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {proveedor.pais}
          {proveedor.ciudad ? ` — ${proveedor.ciudad}` : ""}
        </p>
      </div>

      {/* Resumen containers */}
      {proveedor.containers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Containers ({proveedor.containers.length})
          </h2>
          <ul className="space-y-2">
            {proveedor.containers.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/containers/${c.id}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {c.numero}
                </Link>
                <div className="flex items-center gap-3">
                  {c.fechaArriboEstimada && (
                    <span className="text-gray-500">
                      Arribo: {new Date(c.fechaArriboEstimada).toLocaleDateString("es-CL")}
                    </span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {ESTADOS_CONTAINER[c.estado] ?? c.estado}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Productos */}
      {proveedor.productos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Productos ({proveedor.productos.length})
          </h2>
          <ul className="space-y-2">
            {proveedor.productos.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/productos/${p.id}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {p.nombre}
                </Link>
                <span className="text-gray-400 text-xs">{p.sku}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulario de edición */}
      <ProveedorForm
        proveedorId={proveedor.id}
        defaultValues={{
          nombre: proveedor.nombre,
          pais: proveedor.pais,
          ciudad: proveedor.ciudad ?? "",
          contactoNombre: proveedor.contactoNombre ?? "",
          contactoEmail: proveedor.contactoEmail ?? "",
          contactoTelefono: proveedor.contactoTelefono ?? "",
          moneda: proveedor.moneda,
          condicionesPago: proveedor.condicionesPago ?? "",
          notas: proveedor.notas ?? "",
        }}
      />
    </div>
  );
}
