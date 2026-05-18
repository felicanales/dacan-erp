import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CalculadoraImportacion } from "@/components/finanzas/CalculadoraImportacion";

export default function CalcularCostoImportacionPage() {
  return (
    <div className="w-full max-w-6xl space-y-6">
      <div>
        <Link
          href="/finanzas"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Finanzas
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Calculadora de importacion
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Simula costo puesto en Chile con FOB, flete, seguro, arancel, IVA y costos locales.
        </p>
      </div>

      <CalculadoraImportacion />
    </div>
  );
}
