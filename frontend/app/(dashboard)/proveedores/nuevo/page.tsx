import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProveedorForm } from "@/components/proveedores/ProveedorForm";

export default function NuevoProveedorPage() {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/proveedores"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Proveedores
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo proveedor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Solo nombre y país son obligatorios.
        </p>
      </div>
      <ProveedorForm />
    </div>
  );
}
