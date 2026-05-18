import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FormularioSuscripcion } from "@/components/finanzas/FormularioSuscripcion";

export default function NuevaSuscripcionPage() {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <Link
          href="/finanzas/suscripciones"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Suscripciones
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nueva suscripcion</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registra un servicio recurrente y su proxima fecha de renovacion.
        </p>
      </div>

      <FormularioSuscripcion />
    </div>
  );
}
