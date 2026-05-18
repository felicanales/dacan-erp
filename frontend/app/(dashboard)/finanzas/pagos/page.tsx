import Link from "next/link";
import { CreditCard } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { buttonVariants } from "@/components/ui/button";
import { FiltroPagos } from "@/components/finanzas/FiltroPagos";
import { TablaPagos } from "@/components/finanzas/TablaPagos";
import { formatCLP, type Pago } from "@/components/finanzas/finanzas-utils";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function appendParam(params: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (!value) return;
  params.set(key, Array.isArray(value) ? value[0] : value);
}

async function getPagos(searchParams: PageProps["searchParams"]): Promise<Pago[]> {
  const rawParams = await searchParams;
  const params = new URLSearchParams();

  appendParam(params, "tipo", rawParams.tipo);
  appendParam(params, "estado", rawParams.estado);
  appendParam(params, "categoria", rawParams.categoria);
  appendParam(params, "duenioTarjeta", rawParams.duenioTarjeta);
  appendParam(params, "mes", rawParams.mes);

  const query = params.toString();

  try {
    return await apiFetch<Pago[]>(`/api/finanzas/pagos${query ? `?${query}` : ""}`);
  } catch {
    return [];
  }
}

export default async function PagosPage({ searchParams }: PageProps) {
  const pagos = await getPagos(searchParams);
  const totalPagado = pagos
    .filter((pago) => pago.estadoPago === "pagado")
    .reduce((total, pago) => total + Number(pago.montoPagadoNum ?? 0), 0);
  const pendientes = pagos.filter((pago) => pago.estadoPago === "pendiente").length;
  const suscripciones = pagos.filter((pago) => pago.tipoPago === "suscripcion").length;
  const conFactura = pagos.filter((pago) => Boolean(pago.factura)).length;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pagos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registro financiero de pagos, suscripciones, tarjetas y facturas.
          </p>
        </div>
        <Link
          href="/finanzas/pagos/nuevo"
          className={cn(
            buttonVariants(),
            "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
          )}
        >
          + Nuevo pago
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total pagado", valor: formatCLP(totalPagado) },
          { label: "Pendientes", valor: pendientes },
          { label: "Suscripciones", valor: suscripciones },
          { label: "Con factura", valor: conFactura },
        ].map(({ label, valor }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-gray-500">
              <CreditCard className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{valor}</p>
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <FiltroPagos total={pagos.length} />
      <TablaPagos pagos={pagos} />
    </div>
  );
}
