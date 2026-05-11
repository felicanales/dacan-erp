import { cn } from "@/lib/utils";

// Colores semánticos para cada estado del sistema.
// Usa clases Tailwind directas para evitar purge en build.
const VARIANTS = {
  // Container estados
  en_preparacion: "bg-slate-100 text-slate-700 border-slate-200",
  en_transito:    "bg-blue-50  text-blue-700  border-blue-200",
  en_aduana:      "bg-amber-50 text-amber-700 border-amber-200",
  liberado:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  descargado:     "bg-gray-100 text-gray-500 border-gray-200",

  // Proveedor / activo
  activo:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactivo:       "bg-gray-100 text-gray-500 border-gray-200",

  // Producto estados
  disponible:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  agotado:        "bg-red-50 text-red-700 border-red-200",
  en_transito_p:  "bg-blue-50 text-blue-700 border-blue-200",
  descontinuado:  "bg-gray-100 text-gray-500 border-gray-200",

  // Cliente B2B
  prospecto:      "bg-violet-50 text-violet-700 border-violet-200",
  // activo ya existe arriba
  // inactivo ya existe arriba

  // Pedido estados
  borrador:       "bg-gray-100 text-gray-500 border-gray-200",
  confirmado:     "bg-blue-50 text-blue-700 border-blue-200",
  en_preparacion_pedido: "bg-amber-50 text-amber-700 border-amber-200",
  despachado:     "bg-indigo-50 text-indigo-700 border-indigo-200",
  entregado:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelado:      "bg-red-50 text-red-700 border-red-200",

  // Tarea estados
  pendiente:      "bg-gray-100 text-gray-500 border-gray-200",
  en_progreso:    "bg-blue-50 text-blue-700 border-blue-200",
  completada:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  // cancelada ya existe arriba

  // Prioridades
  alta:           "bg-red-50 text-red-700 border-red-200",
  media:          "bg-amber-50 text-amber-700 border-amber-200",
  baja:           "bg-gray-100 text-gray-500 border-gray-200",
} as const;

type StatusKey = keyof typeof VARIANTS;

const DOTS: Partial<Record<StatusKey, string>> = {
  en_transito:   "bg-blue-500",
  en_aduana:     "bg-amber-500",
  liberado:      "bg-emerald-500",
  activo:        "bg-emerald-500",
  disponible:    "bg-emerald-500",
  en_progreso:   "bg-blue-500",
  confirmado:    "bg-blue-500",
  despachado:    "bg-indigo-500",
  entregado:     "bg-emerald-500",
  completada:    "bg-emerald-500",
  alta:          "bg-red-500",
  media:         "bg-amber-500",
  prospecto:     "bg-violet-500",
};

type Props = {
  status: string;
  label: string;
  dot?: boolean;
  className?: string;
};

export function StatusBadge({ status, label, dot = false, className }: Props) {
  const variant = VARIANTS[status as StatusKey] ?? "bg-gray-100 text-gray-500 border-gray-200";
  const dotColor = DOTS[status as StatusKey];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant,
        className
      )}
    >
      {dot && dotColor && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      )}
      {label}
    </span>
  );
}
