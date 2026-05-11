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

type ContainerEstado =
  | "en_preparacion"
  | "en_transito"
  | "en_aduana"
  | "liberado"
  | "descargado";

const ESTADOS: { value: ContainerEstado; label: string }[] = [
  { value: "en_preparacion", label: "En preparación" },
  { value: "en_transito", label: "En tránsito" },
  { value: "en_aduana", label: "En aduana" },
  { value: "liberado", label: "Liberado" },
  { value: "descargado", label: "Descargado" },
];

type Props = {
  containerId: string;
  estadoActual: ContainerEstado;
};

export function CambiarEstado({ containerId, estadoActual }: Props) {
  const router = useRouter();
  const [nuevoEstado, setNuevoEstado] = useState<ContainerEstado>(estadoActual);
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambioHecho = nuevoEstado === estadoActual;

  async function handleCambio() {
    if (cambioHecho) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"}/api/containers/${containerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado, nota: nota || undefined }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al cambiar estado");
      }

      setNota("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Nuevo estado</Label>
        <Select
          value={nuevoEstado}
          onValueChange={(v) => setNuevoEstado(v as ContainerEstado)}
        >
          <SelectTrigger>
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
        <Label htmlFor="nota-estado">Nota (opcional)</Label>
        <Textarea
          id="nota-estado"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej: Llegó al puerto, en espera de inspección"
          rows={2}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <Button
        onClick={handleCambio}
        disabled={cambioHecho || loading}
        className="w-full"
      >
        {loading ? "Actualizando..." : "Actualizar estado"}
      </Button>
    </div>
  );
}
