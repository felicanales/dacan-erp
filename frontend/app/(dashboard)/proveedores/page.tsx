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
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Globe, Package } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Proveedores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de proveedores y contactos comerciales
          </p>
        </div>
        <Button asChild>
          <Link href="/proveedores/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo proveedor
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {proveedores.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: proveedores.length, icon: Building2, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" },
            { label: "Activos", value: activos, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Países", value: paises, icon: Globe, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`bg-white rounded-xl border ${border} px-5 py-4 flex items-center gap-3 shadow-sm`}>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {proveedores.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium">Sin proveedores registrados</p>
          <p className="text-gray-500 text-sm mt-1">
            Agrega tu primer proveedor para empezar a registrar containers.
          </p>
          <Button asChild className="mt-5">
            <Link href="/proveedores/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Agregar proveedor
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Nombre</TableHead>
                <TableHead className="font-semibold text-gray-700">País / Ciudad</TableHead>
                <TableHead className="font-semibold text-gray-700">Contacto</TableHead>
                <TableHead className="font-semibold text-gray-700">Moneda</TableHead>
                <TableHead className="text-center font-semibold text-gray-700">
                  <span className="flex items-center justify-center gap-1">
                    <Package className="h-3.5 w-3.5" /> Productos
                  </span>
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700">Containers</TableHead>
                <TableHead className="font-semibold text-gray-700">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  <TableCell>
                    <Link
                      href={`/proveedores/${p.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {p.nombre}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{p.pais}</span>
                    {p.ciudad && (
                      <span className="text-gray-400 text-xs block mt-0.5">
                        {p.ciudad}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.contactoNombre ? (
                      <>
                        <span className="text-gray-900 text-sm">{p.contactoNombre}</span>
                        {p.contactoEmail && (
                          <a
                            href={`mailto:${p.contactoEmail}`}
                            className="block text-xs text-gray-400 hover:text-blue-500 mt-0.5"
                          >
                            {p.contactoEmail}
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                      {p.moneda}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-600 font-medium">{p._count.productos}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-600 font-medium">{p._count.containers}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={p.activo ? "activo" : "inactivo"}
                      label={p.activo ? "Activo" : "Inactivo"}
                      dot
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
