"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
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
import type { CategoriaFinanzas, EstadoSuscripcion } from "./types";
import {
  CATEGORIA_LABELS,
  CATEGORIAS_FINANZAS,
  ESTADO_SUSCRIPCION_LABELS,
  ESTADOS_SUSCRIPCION,
} from "./finanzas-utils";

type FormState = {
  nombre: string;
  categoria: CategoriaFinanzas | "none";
  estado: EstadoSuscripcion;
  fechaAdquisicion: string;
  fechaRenovacion: string;
};

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

function dateToIso(value: string) {
  return value ? new Date(`${value}T12:00:00`).toISOString() : null;
}

export function FormularioSuscripcion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    nombre: "",
    categoria: "none",
    estado: "activa",
    fechaAdquisicion: "",
    fechaRenovacion: "",
  });

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/finanzas/suscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          categoria: form.categoria === "none" ? null : form.categoria,
          estado: form.estado,
          fechaAdquisicion: dateToIso(form.fechaAdquisicion),
          fechaRenovacion: dateToIso(form.fechaRenovacion),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar suscripcion");
      }

      router.push("/finanzas/suscripciones");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar suscripcion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Datos de la suscripcion</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              className={inputClass}
              value={form.nombre}
              onChange={(event) => update("nombre", event.target.value)}
              placeholder="Ej: Google Workspace"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(value) =>
                update("categoria", value as CategoriaFinanzas | "none")
              }
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoria</SelectItem>
                {CATEGORIAS_FINANZAS.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {CATEGORIA_LABELS[categoria]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select
              value={form.estado}
              onValueChange={(value) =>
                update("estado", value as EstadoSuscripcion)
              }
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_SUSCRIPCION.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {ESTADO_SUSCRIPCION_LABELS[estado]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fechaAdquisicion">Fecha adquisicion</Label>
            <Input
              id="fechaAdquisicion"
              type="date"
              className={inputClass}
              value={form.fechaAdquisicion}
              onChange={(event) => update("fechaAdquisicion", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fechaRenovacion">Fecha renovacion</Label>
            <Input
              id="fechaRenovacion"
              type="date"
              className={inputClass}
              value={form.fechaRenovacion}
              onChange={(event) => update("fechaRenovacion", event.target.value)}
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={loading}
          className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar suscripcion
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => router.back()}
          className="h-9 w-full sm:w-auto"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
