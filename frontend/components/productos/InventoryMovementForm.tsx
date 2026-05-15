"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { InventarioMovimientoTipo } from "./types";
import { MOVIMIENTO_LABELS } from "./producto-utils";

type InventoryMovementFormProps = {
  productoId: string;
  stockDisponible: number;
  stockEnTransito: number;
  containerId: string | null;
  disabled?: boolean;
};

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

const MOVIMIENTOS: InventarioMovimientoTipo[] = [
  "ingreso_disponible",
  "ingreso_transito",
  "confirmacion_transito",
  "salida",
  "devolucion",
  "merma",
  "ajuste_disponible",
  "ajuste_transito",
];

export function InventoryMovementForm({
  productoId,
  stockDisponible,
  stockEnTransito,
  containerId,
  disabled,
}: InventoryMovementFormProps) {
  const router = useRouter();
  const [tipo, setTipo] = useState<InventarioMovimientoTipo>(
    stockEnTransito > 0 ? "confirmacion_transito" : "ingreso_disponible"
  );
  const [cantidad, setCantidad] = useState(
    stockEnTransito > 0 ? String(stockEnTransito) : "1"
  );
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsContainer = tipo === "ingreso_transito" || tipo === "confirmacion_transito";
  const canSubmit = !disabled && (!needsContainer || Boolean(containerId));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/productos/${productoId}/inventario/movimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          cantidad: Number(cantidad || 0),
          containerId,
          nota: nota || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo registrar el movimiento");
      }

      setNota("");
      if (tipo === "confirmacion_transito") setCantidad("1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el movimiento");
    } finally {
      setLoading(false);
    }
  }

  function onTipoChange(value: string | null) {
    if (!value) return;
    const nextTipo = value as InventarioMovimientoTipo;
    setTipo(nextTipo);
    if (nextTipo === "confirmacion_transito" && stockEnTransito > 0) {
      setCantidad(String(stockEnTransito));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-900">Movimiento</Label>
          <Select value={tipo} onValueChange={onTipoChange}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOVIMIENTOS.map((movimiento) => (
                <SelectItem key={movimiento} value={movimiento}>
                  {MOVIMIENTO_LABELS[movimiento]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cantidad-movimiento" className="text-sm font-medium text-gray-900">
            Cantidad
          </Label>
          <Input
            id="cantidad-movimiento"
            type="number"
            step={1}
            className={inputClass}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Disponible</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{stockDisponible}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">En transito</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{stockEnTransito}</p>
        </div>
      </div>

      {needsContainer && !containerId && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Asigna un container al producto antes de registrar stock en transito.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="nota-movimiento" className="text-sm font-medium text-gray-900">
          Nota
        </Label>
        <Textarea
          id="nota-movimiento"
          rows={3}
          className="resize-none border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej: recepcion parcial, ajuste por conteo fisico, muestra entregada."
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={!canSubmit || loading}
        className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Registrando..." : "Registrar movimiento"}
      </Button>
    </form>
  );
}
