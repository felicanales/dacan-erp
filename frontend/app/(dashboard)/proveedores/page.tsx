import Link from "next/link";
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
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Proveedor = {
  id: string;
  nombre: string;
  pais: string;
  ciudad: string | null;
  contactoNombre: string | null;
  contactoEmail: string | null;
  moneda: string;
  activo: boolean;
  _count: { productos: number; containers: number };
};

async function getProveedores(): Promise<Proveedor[]> {
  try {
    return await apiFetch<Proveedor[]>("/api/proveedores");
  } catch {
    return [];
  }
}

export default async function ProveedoresPage() {
  const proveedores = await getProveedores();
  const activos = proveedores.filter((p) => p.activo).length;
  const paises = new Set(proveedores.map((p) => p.pais)).size;

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Proveedores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de proveedores y contactos comerciales
          </p>
        </div>
        <Link
          href="/proveedores/nuevo"
          className={cn(buttonVariants(), "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto")}
        >
          + Nuevo proveedor
        </Link>
      </div>

      {/* Stats */}
      {proveedores.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { label: "Total",   valor: proveedores.length },
            { label: "Activos", valor: activos },
            { label: "Países",  valor: paises },
          ].map(({ label, valor }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-3xl font-bold text-gray-900">{valor}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla / Empty state */}
      {proveedores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center sm:py-16">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">No hay proveedores aún</p>
          <p className="text-sm text-gray-500 mt-1">
            Comienza agregando un proveedor.
          </p>
          <Link
            href="/proveedores/nuevo"
            className={cn(buttonVariants(), "mt-4 h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto")}
          >
            + Nuevo proveedor
          </Link>
        </div>
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {proveedores.map((p) => (
            <Link
              key={p.id}
              href={`/proveedores/${p.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{p.nombre}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {p.pais}{p.ciudad ? ` / ${p.ciudad}` : ""}
                  </p>
                </div>
                <span className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                  p.activo
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-500 border-gray-200",
                ].join(" ")}>
                  <span className={["h-1.5 w-1.5 rounded-full", p.activo ? "bg-emerald-500" : "bg-gray-400"].join(" ")} />
                  {p.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Contacto</p>
                  <p className="mt-0.5 truncate text-gray-900">{p.contactoNombre ?? "â€”"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Moneda</p>
                  <p className="mt-0.5 font-mono text-gray-900">{p.moneda}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Productos</p>
                  <p className="mt-0.5 text-gray-900">{p._count.productos}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Containers</p>
                  <p className="mt-0.5 text-gray-900">{p._count.containers}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4">Nombre</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4">País / Ciudad</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4">Contacto</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4">Moneda</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4 text-center">Productos</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4 text-center">Containers</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide h-9 px-4">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <TableCell className="py-3 px-4">
                    <Link
                      href={`/proveedores/${p.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {p.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="text-sm text-gray-900">{p.pais}</span>
                    {p.ciudad && (
                      <span className="text-xs text-gray-500 block mt-0.5">{p.ciudad}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {p.contactoNombre ? (
                      <>
                        <span className="text-sm text-gray-900">{p.contactoNombre}</span>
                        {p.contactoEmail && (
                          <a
                            href={`mailto:${p.contactoEmail}`}
                            className="text-xs text-gray-500 hover:text-blue-600 block mt-0.5"
                          >
                            {p.contactoEmail}
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                      {p.moneda}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <span className="text-sm text-gray-900">{p._count.productos}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <span className="text-sm text-gray-900">{p._count.containers}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className={[
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                      p.activo
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-500 border-gray-200",
                    ].join(" ")}>
                      <span className={["h-1.5 w-1.5 rounded-full", p.activo ? "bg-emerald-500" : "bg-gray-400"].join(" ")} />
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
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
