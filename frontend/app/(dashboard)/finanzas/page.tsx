import Link from "next/link";
import { Calculator, CreditCard, FileText, Repeat2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResumenFinanzasCard } from "@/components/finanzas/ResumenFinanzasCard";
import type { ResumenFinanciero } from "@/components/finanzas/finanzas-utils";
import {
  CATEGORIA_LABELS,
  formatDate,
} from "@/components/finanzas/finanzas-utils";

async function getResumen(): Promise<ResumenFinanciero> {
  try {
    return await apiFetch<ResumenFinanciero>("/api/finanzas/resumen");
  } catch {
    return {
      totalPagadoMes: 0,
      totalSuscripciones: 0,
      costoSuscripcionesMes: 0,
      pagosPendientes: 0,
      proximasRenovaciones: [],
    };
  }
}

export default async function FinanzasPage() {
  const resumen = await getResumen();

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Finanzas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Control de pagos, suscripciones y costos de importacion.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/finanzas/pagos/nuevo"
            className={cn(
              buttonVariants(),
              "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
            )}
          >
            + Nuevo pago
          </Link>
          <Link
            href="/finanzas/costos-importacion/calcular"
            className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full sm:w-auto")}
          >
            Calculadora
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenFinanzasCard
          label="Pagado este mes"
          value={resumen.totalPagadoMes}
          format="clp"
          icon={CreditCard}
        />
        <ResumenFinanzasCard
          label="Suscripciones activas"
          value={resumen.totalSuscripciones}
          icon={Repeat2}
        />
        <ResumenFinanzasCard
          label="Costo suscripciones"
          value={resumen.costoSuscripcionesMes}
          format="clp"
          icon={FileText}
        />
        <ResumenFinanzasCard
          label="Pagos pendientes"
          value={resumen.pagosPendientes}
          icon={CreditCard}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Accesos rapidos</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                href: "/finanzas/pagos",
                label: "Pagos",
                detail: "Registro y seguimiento",
                icon: CreditCard,
              },
              {
                href: "/finanzas/suscripciones",
                label: "Suscripciones",
                detail: "Servicios recurrentes",
                icon: Repeat2,
              },
              {
                href: "/finanzas/costos-importacion/calcular",
                label: "Costos importacion",
                detail: "CIF, arancel e IVA",
                icon: Calculator,
              },
            ].map(({ href, label, detail, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <Icon className="h-5 w-5 text-gray-500" />
                <p className="mt-3 text-sm font-semibold text-gray-900">{label}</p>
                <p className="mt-1 text-xs text-gray-500">{detail}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Proximas renovaciones</h2>
          {resumen.proximasRenovaciones.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No hay renovaciones registradas.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {resumen.proximasRenovaciones.map((suscripcion) => (
                <div
                  key={suscripcion.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {suscripcion.nombre}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {suscripcion.categoria
                      ? CATEGORIA_LABELS[suscripcion.categoria]
                      : "Sin categoria"}{" "}
                    - {formatDate(suscripcion.fechaRenovacion)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
