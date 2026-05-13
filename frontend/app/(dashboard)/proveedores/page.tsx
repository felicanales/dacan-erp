import Link from "next/link";
import { Building2 } from "lucide-react";
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
import { ProveedorActions } from "@/components/proveedores/ProveedorActions";
import { cn } from "@/lib/utils";

type Proveedor = {
  id: string;
  nombre: string;
  pais: string;
  ciudad: string | null;
  contactoNombre: string | null;
  contactoEmail: string | null;
  moneda: string;
  notas: string | null;
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
  const paises = new Set(proveedores.map((p) => p.pais)).size;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Proveedores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion de proveedores y contactos comerciales
          </p>
        </div>
        <Link
          href="/proveedores/nuevo"
          className={cn(
            buttonVariants(),
            "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
          )}
        >
          + Nuevo proveedor
        </Link>
      </div>

      {proveedores.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { label: "Total", valor: proveedores.length },
            { label: "Países", valor: paises },
          ].map(({ label, valor }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-3xl font-bold text-gray-900">{valor}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {proveedores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center sm:py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <Building2 className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">No hay proveedores aun</p>
          <p className="mt-1 text-sm text-gray-500">Comienza agregando un proveedor.</p>
          <Link
            href="/proveedores/nuevo"
            className={cn(
              buttonVariants(),
              "mt-4 h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
            )}
          >
            + Nuevo proveedor
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {proveedores.map((p) => {
              const canDelete = p._count.productos === 0 && p._count.containers === 0;

              return (
                <div
                  key={p.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{p.nombre}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {p.pais}{p.ciudad ? ` / ${p.ciudad}` : ""}
                      </p>
                    </div>
                    <span
                      className={[
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                        p.activo
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full",
                          p.activo ? "bg-emerald-500" : "bg-gray-400",
                        ].join(" ")}
                      />
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Contacto</p>
                      <p className="mt-0.5 truncate text-gray-900">{p.contactoNombre ?? "-"}</p>
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
                  {p.notas && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">{p.notas}</p>
                  )}
                  <div className="mt-4">
                    <ProveedorActions
                      proveedorId={p.id}
                      proveedorNombre={p.nombre}
                      canDelete={canDelete}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  <TableHead className="h-9 w-[22%] px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Nombre
                  </TableHead>
                  <TableHead className="h-9 w-[14%] px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Pais / Ciudad
                  </TableHead>
                  <TableHead className="h-9 w-[22%] px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Contacto
                  </TableHead>
                  <TableHead className="h-9 w-[18%] px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Notas
                  </TableHead>
                  <TableHead className="h-9 px-4 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    Items
                  </TableHead>
                  <TableHead className="h-9 px-4 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.map((p) => {
                  const canDelete = p._count.productos === 0 && p._count.containers === 0;

                  return (
                    <TableRow
                      key={p.id}
                      className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                    >
                      <TableCell className="px-4 py-3 align-top">
                        <Link
                          href={`/proveedores/${p.id}`}
                          className="text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
                        >
                          {p.nombre}
                        </Link>
                        <span className="mt-1 block text-xs font-mono text-gray-500">
                          {p.moneda}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-top">
                        <span className="text-sm text-gray-900">{p.pais}</span>
                        {p.ciudad && (
                          <span className="mt-0.5 block text-xs text-gray-500">{p.ciudad}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-top">
                        {p.contactoNombre ? (
                          <>
                            <span className="text-sm text-gray-900">{p.contactoNombre}</span>
                            {p.contactoEmail && (
                              <a
                                href={`mailto:${p.contactoEmail}`}
                                className="mt-0.5 block text-xs text-gray-500 hover:text-blue-600"
                              >
                                {p.contactoEmail}
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs px-4 py-3 align-top">
                        <p className="line-clamp-2 whitespace-normal text-sm text-gray-500">
                          {p.notas || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center align-top">
                        <span className="text-sm text-gray-900">{p._count.productos}</span>
                        <span className="mx-1 text-gray-300">/</span>
                        <span className="text-sm text-gray-900">{p._count.containers}</span>
                        <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-gray-400">
                          Prod / cont
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-top">
                        <ProveedorActions
                          proveedorId={p.id}
                          proveedorNombre={p.nombre}
                          canDelete={canDelete}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
