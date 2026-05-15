import type { ProductoEstado } from "./types";
import type { InventarioMovimientoTipo } from "./types";

export const PRODUCTO_ESTADO_LABELS: Record<ProductoEstado, string> = {
  disponible: "Disponible",
  agotado: "Agotado",
  en_transito: "En transito",
  descontinuado: "Descontinuado",
};

export const PRODUCTO_ESTADO_BADGE: Record<ProductoEstado, string> = {
  disponible: "bg-emerald-50 text-emerald-700 border-emerald-200",
  agotado: "bg-red-50 text-red-700 border-red-200",
  en_transito: "bg-blue-50 text-blue-700 border-blue-200",
  descontinuado: "bg-gray-100 text-gray-500 border-gray-200",
};

export const MOVIMIENTO_LABELS: Record<InventarioMovimientoTipo, string> = {
  ingreso_disponible: "Ingreso disponible",
  ingreso_transito: "Ingreso en transito",
  confirmacion_transito: "Confirmar transito",
  salida: "Salida",
  devolucion: "Devolucion",
  merma: "Merma",
  ajuste_disponible: "Ajuste disponible",
  ajuste_transito: "Ajuste en transito",
};

export function formatCLP(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatUSD(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function getCoverImage(fotos: string[], fotoPortada?: string | null) {
  if (fotoPortada && fotos.includes(fotoPortada)) return fotoPortada;
  return fotos[0] ?? null;
}

export function stockLabel(stockDisponible: number, stockMinimo: number) {
  if (stockDisponible === 0) return "Sin stock disponible";
  if (stockDisponible <= stockMinimo) return "Stock bajo";
  return "Stock OK";
}

export function stockBadgeClass(stockDisponible: number, stockMinimo: number) {
  if (stockDisponible === 0) return "bg-red-50 text-red-700 border-red-200";
  if (stockDisponible <= stockMinimo) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}
