import { cn } from "@/lib/utils";
import type { EstadoPago } from "@/components/finanzas/finanzas-utils";
import {
  ESTADO_PAGO_OPTIONS,
  optionLabel,
} from "@/components/finanzas/finanzas-utils";

const ESTADO_PAGO_BADGE: Record<EstadoPago, string> = {
  pagado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pendiente: "border-amber-200 bg-amber-50 text-amber-700",
  fallido: "border-red-200 bg-red-50 text-red-700",
  reembolsado: "border-sky-200 bg-sky-50 text-sky-700",
};

const ESTADO_PAGO_DOT: Record<EstadoPago, string> = {
  pagado: "bg-emerald-500",
  pendiente: "bg-amber-500",
  fallido: "bg-red-500",
  reembolsado: "bg-sky-500",
};

type BadgeEstadoPagoProps = {
  estado: EstadoPago;
};

export function BadgeEstadoPago({ estado }: BadgeEstadoPagoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        ESTADO_PAGO_BADGE[estado]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", ESTADO_PAGO_DOT[estado])} />
      {optionLabel(ESTADO_PAGO_OPTIONS, estado)}
    </span>
  );
}
