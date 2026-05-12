import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
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

const ESTADO_CONTAINER: Record<string, string> = {
  en_preparacion: "En preparación",
  en_transito:    "En tránsito",
  en_aduana:      "En aduana",
  liberado:       "Liberado",
  descargado:     "Descargado",
};

const ESTADO_BADGE: Record<string, string> = {
  en_preparacion: "bg-gray-100 text-gray-500 border-gray-200",
  en_transito:    "bg-blue-50 text-blue-700 border-blue-200",
  en_aduana:      "bg-amber-50 text-amber-700 border-amber-200",
  liberado:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  descargado:     "bg-gray-100 text-gray-500 border-gray-200",
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
    <div className="w-full max-w-4xl space-y-6">
      {/* Breadcrumb + título */}
      <div>
        <Link
          href="/proveedores"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Proveedores
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{proveedor.nombre}</h1>
          <span className={[
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
            proveedor.activo
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-500 border-gray-200",
          ].join(" ")}>
            <span className={["h-1.5 w-1.5 rounded-full", proveedor.activo ? "bg-emerald-500" : "bg-gray-400"].join(" ")} />
            {proveedor.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {proveedor.pais}{proveedor.ciudad ? ` — ${proveedor.ciudad}` : ""}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Informacion completa</h2>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Contacto</dt>
            <dd className="mt-1 text-gray-900">{proveedor.contactoNombre || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Correo</dt>
            <dd className="mt-1 text-gray-900">
              {proveedor.contactoEmail ? (
                <a href={`mailto:${proveedor.contactoEmail}`} className="hover:text-blue-600">
                  {proveedor.contactoEmail}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Telefono / WhatsApp</dt>
            <dd className="mt-1 text-gray-900">{proveedor.contactoTelefono || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Moneda</dt>
            <dd className="mt-1 font-mono text-gray-900">{proveedor.moneda}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-gray-500">Condiciones de pago</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {proveedor.condicionesPago || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-gray-500">Notas</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">{proveedor.notas || "-"}</dd>
          </div>
        </dl>
      </div>

      {/* Containers */}
      {proveedor.containers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Containers ({proveedor.containers.length})
          </h2>
          <ul className="divide-y divide-gray-200">
            {proveedor.containers.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/containers/${c.id}`}
                  className="font-mono text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {c.numero}
                </Link>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {c.fechaArriboEstimada && (
                    <span className="text-xs text-gray-500">
                      Arribo: {new Date(c.fechaArriboEstimada).toLocaleDateString("es-CL")}
                    </span>
                  )}
                  <span className={[
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                    ESTADO_BADGE[c.estado] ?? "bg-gray-100 text-gray-500 border-gray-200",
                  ].join(" ")}>
                    {ESTADO_CONTAINER[c.estado] ?? c.estado}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Productos */}
      {proveedor.productos.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Productos ({proveedor.productos.length})
          </h2>
          <ul className="divide-y divide-gray-200">
            {proveedor.productos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link
                  href={`/productos/${p.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {p.nombre}
                </Link>
                <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                  {p.sku}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulario edición */}
      <div id="editar">
        <ProveedorForm
          proveedorId={proveedor.id}
          defaultValues={{
            nombre:           proveedor.nombre,
            pais:             proveedor.pais,
            ciudad:           proveedor.ciudad           ?? "",
            contactoNombre:   proveedor.contactoNombre   ?? "",
            contactoEmail:    proveedor.contactoEmail    ?? "",
            contactoTelefono: proveedor.contactoTelefono ?? "",
            moneda:           proveedor.moneda,
            condicionesPago:  proveedor.condicionesPago  ?? "",
            notas:            proveedor.notas            ?? "",
          }}
        />
      </div>
    </div>
  );
}
