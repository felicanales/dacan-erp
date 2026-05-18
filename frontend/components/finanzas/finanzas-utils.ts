import type {
  CategoriaFinanzas,
  DuenioTarjeta,
  EstadoPago,
  EstadoSuscripcion,
  TipoPago,
} from "./types";

export type {
  CategoriaFinanzas,
  DuenioTarjeta,
  EstadoPago,
  EstadoSuscripcion,
  Pago,
  ResultadoCostoImportacion,
  ResumenFinanciero,
  SuscripcionResumen,
  TipoPago,
} from "./types";

export type Option<T extends string> = {
  value: T;
  label: string;
};

export const TIPO_PAGO_LABELS: Record<TipoPago, string> = {
  suscripcion: "Suscripcion",
  gasto_unico: "Gasto unico",
  servicio_puntual: "Servicio puntual",
  reembolso_ajuste: "Reembolso / ajuste",
};

export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  fallido: "Fallido",
  reembolsado: "Reembolsado",
};

export const ESTADO_SUSCRIPCION_LABELS: Record<EstadoSuscripcion, string> = {
  activa: "Activa",
  pausada: "Pausada",
  cancelada: "Cancelada",
};

export const CATEGORIA_LABELS: Record<CategoriaFinanzas, string> = {
  tecnologia: "Tecnologia",
  marketing: "Marketing",
  logistica: "Logistica",
  administracion: "Administracion",
  disenio: "Diseno",
  finanzas: "Finanzas",
};

export const DUENIO_TARJETA_LABELS: Record<DuenioTarjeta, string> = {
  galie: "Galie",
  alejandro: "Alejandro",
  felipe: "Felipe",
  juan_jose: "Juan Jose",
  lorenzo: "Lorenzo",
};

export const TIPOS_PAGO = Object.keys(TIPO_PAGO_LABELS) as TipoPago[];
export const ESTADOS_PAGO = Object.keys(ESTADO_PAGO_LABELS) as EstadoPago[];
export const ESTADOS_SUSCRIPCION = Object.keys(
  ESTADO_SUSCRIPCION_LABELS
) as EstadoSuscripcion[];
export const CATEGORIAS_FINANZAS = Object.keys(CATEGORIA_LABELS) as CategoriaFinanzas[];
export const DUENIOS_TARJETA = Object.keys(DUENIO_TARJETA_LABELS) as DuenioTarjeta[];

export const TIPO_PAGO_OPTIONS: Option<TipoPago>[] = TIPOS_PAGO.map((value) => ({
  value,
  label: TIPO_PAGO_LABELS[value],
}));

export const ESTADO_PAGO_OPTIONS: Option<EstadoPago>[] = ESTADOS_PAGO.map((value) => ({
  value,
  label: ESTADO_PAGO_LABELS[value],
}));

export const ESTADO_SUSCRIPCION_OPTIONS: Option<EstadoSuscripcion>[] =
  ESTADOS_SUSCRIPCION.map((value) => ({
    value,
    label: ESTADO_SUSCRIPCION_LABELS[value],
  }));

export const CATEGORIA_FINANZAS_OPTIONS: Option<CategoriaFinanzas>[] =
  CATEGORIAS_FINANZAS.map((value) => ({
    value,
    label: CATEGORIA_LABELS[value],
  }));

export const DUENIO_TARJETA_OPTIONS: Option<DuenioTarjeta>[] = DUENIOS_TARJETA.map(
  (value) => ({
    value,
    label: DUENIO_TARJETA_LABELS[value],
  })
);

export function optionLabel<T extends string>(
  options: readonly Option<T>[],
  value: T | null | undefined
) {
  if (!value) return "-";
  return options.find((option) => option.value === value)?.label ?? value;
}

export function formatCLP(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "-";

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

export function estadoPagoClass(estado: EstadoPago) {
  const classes: Record<EstadoPago, string> = {
    pagado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    fallido: "bg-red-50 text-red-700 border-red-200",
    reembolsado: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return classes[estado];
}

export function estadoSuscripcionClass(estado: EstadoSuscripcion) {
  const classes: Record<EstadoSuscripcion, string> = {
    activa: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pausada: "bg-amber-50 text-amber-700 border-amber-200",
    cancelada: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return classes[estado];
}
