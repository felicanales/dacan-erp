import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProveedorForm } from "@/components/proveedores/ProveedorForm";

export default function NuevoProveedorPage() {
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
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo proveedor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Completa los datos del proveedor. Solo nombre y país son obligatorios.
        </p>
      </div>
      <ProveedorForm />
    </div>
  );
}
