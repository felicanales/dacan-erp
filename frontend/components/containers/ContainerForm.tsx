"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Proveedor = { id: string; nombre: string; pais: string };

type ContainerFormData = {
  numero: string;
  proveedorId: string;
  puertoOrigen: string;
  puertoDestino: string;
  fechaSalida: string;
  fechaArriboEstimada: string;
  costoTotal: string;
  contenidoResumen: string;
  notas: string;
};

type Props = {
  proveedores: Proveedor[];
  defaultValues?: Partial<ContainerFormData>;
  containerId?: string;
};

export function ContainerForm({ proveedores, defaultValues, containerId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ContainerFormData>({
    numero: defaultValues?.numero ?? "",
    proveedorId: defaultValues?.proveedorId ?? "",
    puertoOrigen: defaultValues?.puertoOrigen ?? "",
    puertoDestino: defaultValues?.puertoDestino ?? "San Antonio",
    fechaSalida: defaultValues?.fechaSalida ?? "",
    fechaArriboEstimada: defaultValues?.fechaArriboEstimada ?? "",
    costoTotal: defaultValues?.costoTotal ?? "",
    contenidoResumen: defaultValues?.contenidoResumen ?? "",
    notas: defaultValues?.notas ?? "",
  });

  function set(field: keyof ContainerFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = containerId
        ? `/api/containers/${containerId}`
        : "/api/containers";
      const method = containerId ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        numero: form.numero,
        proveedorId: form.proveedorId,
        puertoOrigen: form.puertoOrigen,
        puertoDestino: form.puertoDestino,
        fechaSalida: form.fechaSalida ? new Date(form.fechaSalida).toISOString() : null,
        fechaArriboEstimada: form.fechaArriboEstimada
          ? new Date(form.fechaArriboEstimada).toISOString()
          : null,
        costoTotal: form.costoTotal ? parseFloat(form.costoTotal) : null,
        contenidoResumen: form.contenidoResumen || null,
        notas: form.notas || null,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"}${url}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar");
      }

      router.push("/containers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Datos del container */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Datos del container
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="numero">
              Número de container <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numero"
              value={form.numero}
              onChange={(e) => set("numero", e.target.value)}
              placeholder="Ej: TCKU3456789"
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proveedorId">
              Proveedor <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.proveedorId}
              onValueChange={(v) => set("proveedorId", v)}
              required
            >
              <SelectTrigger id="proveedorId">
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} — {p.pais}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Ruta */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Ruta y fechas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="puertoOrigen">
              Puerto de origen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="puertoOrigen"
              value={form.puertoOrigen}
              onChange={(e) => set("puertoOrigen", e.target.value)}
              placeholder="Ej: Shanghái"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="puertoDestino">Puerto de destino</Label>
            <Input
              id="puertoDestino"
              value={form.puertoDestino}
              onChange={(e) => set("puertoDestino", e.target.value)}
              placeholder="Ej: San Antonio"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaSalida">Fecha de salida</Label>
            <Input
              id="fechaSalida"
              type="date"
              value={form.fechaSalida}
              onChange={(e) => set("fechaSalida", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaArriboEstimada">Arribo estimado</Label>
            <Input
              id="fechaArriboEstimada"
              type="date"
              value={form.fechaArriboEstimada}
              onChange={(e) => set("fechaArriboEstimada", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Contenido y costos */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Contenido y costos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="costoTotal">Costo total (USD)</Label>
            <Input
              id="costoTotal"
              type="number"
              min={0}
              step={0.01}
              value={form.costoTotal}
              onChange={(e) => set("costoTotal", e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contenidoResumen">Resumen del contenido</Label>
          <Textarea
            id="contenidoResumen"
            value={form.contenidoResumen}
            onChange={(e) => set("contenidoResumen", e.target.value)}
            placeholder="Ej: 500 unidades producto A, 200 unidades producto B..."
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas adicionales</Label>
          <Textarea
            id="notas"
            value={form.notas}
            onChange={(e) => set("notas", e.target.value)}
            placeholder="Observaciones sobre el envío, acuerdos especiales, etc."
            rows={3}
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : containerId
            ? "Guardar cambios"
            : "Crear container"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
