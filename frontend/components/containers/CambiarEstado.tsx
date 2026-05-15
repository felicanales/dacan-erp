"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type ContainerEstado =
  | "en_preparacion"
  | "en_transito"
  | "en_aduana"
  | "liberado"
  | "descargado";

const ESTADOS: { value: ContainerEstado; label: string }[] = [
  { value: "en_preparacion", label: "En preparación" },
  { value: "en_transito",    label: "En tránsito" },
  { value: "en_aduana",      label: "En aduana" },
  { value: "liberado",       label: "Liberado" },
  { value: "descargado",     label: "Descargado" },
];

type Props = {
  containerId: string;
  estadoActual: ContainerEstado;
};

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

export function CambiarEstado({ containerId, estadoActual }: Props) {
  const router = useRouter();
  const [nuevoEstado, setNuevoEstado] = useState<ContainerEstado>(estadoActual);
  const [nota,        setNota]        = useState("");
  const [confirmarStockTransito, setConfirmarStockTransito] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const sinCambio = nuevoEstado === estadoActual;

  async function handleCambio() {
    if (sinCambio) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/containers/${containerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          nota: nota || undefined,
          confirmarStockTransito:
            nuevoEstado === "descargado" ? confirmarStockTransito : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al cambiar estado");
      }
      setNota("");
      setConfirmarStockTransito(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-900">Nuevo estado</Label>
        <Select
          value={nuevoEstado}
          onValueChange={(v) => {
            if (v) setNuevoEstado(v as ContainerEstado);
          }}
        >
          <SelectTrigger className={inputClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nota-estado" className="text-sm font-medium text-gray-900">
          Nota <span className="text-gray-500 font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="nota-estado"
          className="border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej: Llegó al puerto, en espera de inspección"
          rows={2}
        />
      </div>
      {nuevoEstado === "descargado" && (
        <label className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-blue-200"
            checked={confirmarStockTransito}
            onChange={(e) => setConfirmarStockTransito(e.target.checked)}
          />
          <span>
            Confirmar stock en transito de los productos asociados y moverlo a stock disponible.
          </span>
        </label>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button
        onClick={handleCambio}
        disabled={sinCambio || loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm h-9 disabled:opacity-40"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {loading ? "Actualizando..." : "Actualizar estado"}
      </Button>
    </div>
  );
}
