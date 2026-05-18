import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { BadgeEstadoPago } from "@/components/finanzas/BadgeEstadoPago";
import { PagoActions } from "@/components/finanzas/PagoActions";
import {
  CATEGORIA_FINANZAS_OPTIONS,
  DUENIO_TARJETA_OPTIONS,
  TIPO_PAGO_OPTIONS,
  formatCLP,
  formatDate,
  optionLabel,
  type CategoriaFinanzas,
  type Pago,
} from "@/components/finanzas/finanzas-utils";
import { cn } from "@/lib/utils";

type TablaPagosProps = {
  pagos: Pago[];
};

function CategoriaBadges({ categorias }: { categorias: CategoriaFinanzas[] }) {
  if (categorias.length === 0) {
    return <span className="text-sm text-gray-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {categorias.map((categoria) => (
        <span
          key={categoria}
          className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600"
        >
          {optionLabel(CATEGORIA_FINANZAS_OPTIONS, categoria)}
        </span>
      ))}
    </div>
  );
}

function MontoPago({ pago }: { pago: Pago }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900">
        {pago.montoPagadoNum ? formatCLP(pago.montoPagadoNum) : pago.monto || "-"}
      </p>
      {pago.montoPagadoNum && pago.monto && (
        <p className="mt-0.5 text-xs text-gray-500">{pago.monto}</p>
      )}
    </div>
  );
}

export function TablaPagos({ pagos }: TablaPagosProps) {
  if (pagos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center sm:py-16">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
          <CreditCard className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-900">No hay pagos registrados</p>
        <p className="mt-1 text-sm text-gray-500">Crea el primer pago de finanzas.</p>
        <Link
          href="/finanzas/pagos/nuevo"
          className={cn(
            buttonVariants(),
            "mt-4 h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
          )}
        >
          + Nuevo pago
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {pagos.map((pago) => (
          <div key={pago.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{pago.nombre}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {optionLabel(TIPO_PAGO_OPTIONS, pago.tipoPago)} / {formatDate(pago.fechaPago)}
                </p>
              </div>
              <BadgeEstadoPago estado={pago.estadoPago} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Monto</p>
                <MontoPago pago={pago} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Tarjeta</p>
                <p className="mt-0.5 truncate text-gray-900">{pago.tarjeta || "-"}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {optionLabel(DUENIO_TARJETA_OPTIONS, pago.duenioTarjeta)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <CategoriaBadges categorias={pago.categorias} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              {pago.factura ? (
                <a
                  href={pago.factura}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  Factura
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-sm text-gray-400">Sin factura</span>
              )}
              <PagoActions pagoId={pago.id} pagoNombre={pago.nombre} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className="h-9 w-[20%] px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Nombre
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Tipo
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Monto
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Fecha
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Estado
              </TableHead>
              <TableHead className="h-9 w-[18%] px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Categoria
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Tarjeta
              </TableHead>
              <TableHead className="h-9 px-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                Factura
              </TableHead>
              <TableHead className="h-9 px-4 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.map((pago) => (
              <TableRow
                key={pago.id}
                className="border-b border-gray-200 transition-colors hover:bg-gray-50"
              >
                <TableCell className="px-4 py-3 align-top">
                  <Link
                    href={`/finanzas/pagos/${pago.id}/editar`}
                    className="text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
                  >
                    {pago.nombre}
                  </Link>
                  {pago.suscripcion && (
                    <span className="mt-1 block text-xs text-gray-500">
                      {pago.suscripcion.nombre}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-sm text-gray-700">
                  {optionLabel(TIPO_PAGO_OPTIONS, pago.tipoPago)}
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <MontoPago pago={pago} />
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-sm text-gray-700">
                  {formatDate(pago.fechaPago)}
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <BadgeEstadoPago estado={pago.estadoPago} />
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <CategoriaBadges categorias={pago.categorias} />
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <span className="block text-sm text-gray-900">{pago.tarjeta || "-"}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {optionLabel(DUENIO_TARJETA_OPTIONS, pago.duenioTarjeta)}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  {pago.factura ? (
                    <a
                      href={pago.factura}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ver
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <PagoActions pagoId={pago.id} pagoNombre={pago.nombre} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
