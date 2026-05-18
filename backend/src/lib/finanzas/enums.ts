export const TIPOS_PAGO = [
  "suscripcion",
  "gasto_unico",
  "servicio_puntual",
  "reembolso_ajuste",
] as const;

export const ESTADOS_PAGO = [
  "pagado",
  "pendiente",
  "fallido",
  "reembolsado",
] as const;

export const ESTADOS_SUSCRIPCION = ["activa", "pausada", "cancelada"] as const;

export const CATEGORIAS_FINANZAS = [
  "tecnologia",
  "marketing",
  "logistica",
  "administracion",
  "disenio",
  "finanzas",
] as const;

export const DUENIOS_TARJETA = [
  "galie",
  "alejandro",
  "felipe",
  "juan_jose",
  "lorenzo",
] as const;

export function normalizeEnumParam<T extends readonly string[]>(
  value: string | null,
  allowed: T
): T[number] | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return allowed.includes(normalized) ? normalized : undefined;
}

export function monthRange(month: string | null) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return undefined;

  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNumber - 1, 1));
  const end = new Date(Date.UTC(year, monthNumber, 1));

  return { gte: start, lt: end };
}
