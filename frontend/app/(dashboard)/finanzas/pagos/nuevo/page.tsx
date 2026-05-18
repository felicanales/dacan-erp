import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FormularioPago } from "@/components/finanzas/FormularioPago";

export default function NuevoPagoPage() {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/finanzas/pagos"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Pagos
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo pago</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nombre, tipo y estado son la base del registro.
        </p>
      </div>
      <FormularioPago />
    </div>
  );
}
