import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ContainerForm } from "@/components/containers/ContainerForm";

type Proveedor = { id: string; nombre: string; pais: string };

async function getProveedores(): Promise<Proveedor[]> {
  try {
    return await apiFetch<Proveedor[]>("/api/proveedores");
  } catch {
    return [];
  }
}

export default async function NuevoContainerPage() {
  const proveedores = await getProveedores();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/containers"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a containers
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo container</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registra el seguimiento de un nuevo envío.
        </p>
      </div>
      <ContainerForm proveedores={proveedores} />
    </div>
  );
}
