import { cn } from "@/lib/utils";
import type { EstadoSuscripcion } from "@/components/finanzas/finanzas-utils";
import {
  ESTADO_SUSCRIPCION_OPTIONS,
  optionLabel,
} from "@/components/finanzas/finanzas-utils";

const ESTADO_SUSCRIPCION_BADGE: Record<EstadoSuscripcion, string> = {
  activa: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pausada: "border-amber-200 bg-amber-50 text-amber-700",
  cancelada: "border-gray-200 bg-gray-100 text-gray-600",
};

const ESTADO_SUSCRIPCION_DOT: Record<EstadoSuscripcion, string> = {
  activa: "bg-emerald-500",
  pausada: "bg-amber-500",
  cancelada: "bg-gray-400",
};

type BadgeEstadoSuscripcionProps = {
  estado: EstadoSuscripcion;
};

export function BadgeEstadoSuscripcion({ estado }: BadgeEstadoSuscripcionProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        ESTADO_SUSCRIPCION_BADGE[estado]
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", ESTADO_SUSCRIPCION_DOT[estado])}
      />
      {optionLabel(ESTADO_SUSCRIPCION_OPTIONS, estado)}
    </span>
  );
}
