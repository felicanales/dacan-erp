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
import { Loader2 } from "lucide-react";

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

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

const labelClass = "text-sm font-medium text-gray-900";

export function ContainerForm({ proveedores, defaultValues, containerId }: Props) {
  const router    = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [form, setForm] = useState<ContainerFormData>({
    numero:              defaultValues?.numero              ?? "",
    proveedorId:         defaultValues?.proveedorId         ?? "",
    puertoOrigen:        defaultValues?.puertoOrigen        ?? "",
    puertoDestino:       defaultValues?.puertoDestino       ?? "San Antonio",
    fechaSalida:         defaultValues?.fechaSalida         ?? "",
    fechaArriboEstimada: defaultValues?.fechaArriboEstimada ?? "",
    costoTotal:          defaultValues?.costoTotal          ?? "",
    contenidoResumen:    defaultValues?.contenidoResumen    ?? "",
    notas:               defaultValues?.notas               ?? "",
  });

  function set(field: keyof ContainerFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url    = containerId ? `/api/containers/${containerId}` : "/api/containers";
      const method = containerId ? "PUT" : "POST";
      const body: Record<string, unknown> = {
        numero:              form.numero,
        proveedorId:         form.proveedorId,
        puertoOrigen:        form.puertoOrigen,
        puertoDestino:       form.puertoDestino,
        fechaSalida:         form.fechaSalida ? new Date(form.fechaSalida).toISOString() : null,
        fechaArriboEstimada: form.fechaArriboEstimada ? new Date(form.fechaArriboEstimada).toISOString() : null,
        costoTotal:          form.costoTotal ? parseFloat(form.costoTotal) : null,
        contenidoResumen:    form.contenidoResumen || null,
        notas:               form.notas || null,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"}${url}`,
        { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar");
      }
      router.push("/containers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos del container */}
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Datos del container</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="numero" className={labelClass}>
              Número de container <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numero"
              className={`${inputClass} font-mono`}
              value={form.numero}
              onChange={(e) => set("numero", e.target.value)}
              placeholder="Ej: TCKU3456789"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proveedorId" className={labelClass}>
              Proveedor <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.proveedorId}
              onValueChange={(v) => set("proveedorId", v ?? "")}
              required
            >
              <SelectTrigger id="proveedorId" className={inputClass}>
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

      {/* Ruta y fechas */}
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Ruta y fechas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="puertoOrigen" className={labelClass}>
              Puerto de origen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="puertoOrigen"
              className={inputClass}
              value={form.puertoOrigen}
              onChange={(e) => set("puertoOrigen", e.target.value)}
              placeholder="Ej: Shanghái"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="puertoDestino" className={labelClass}>Puerto de destino</Label>
            <Input
              id="puertoDestino"
              className={inputClass}
              value={form.puertoDestino}
              onChange={(e) => set("puertoDestino", e.target.value)}
              placeholder="Ej: San Antonio"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaSalida" className={labelClass}>Fecha de salida</Label>
            <Input
              id="fechaSalida"
              type="date"
              className={inputClass}
              value={form.fechaSalida}
              onChange={(e) => set("fechaSalida", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaArriboEstimada" className={labelClass}>Arribo estimado</Label>
            <Input
              id="fechaArriboEstimada"
              type="date"
              className={inputClass}
              value={form.fechaArriboEstimada}
              onChange={(e) => set("fechaArriboEstimada", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Contenido y costos */}
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Contenido y costos</h2>
        <div className="max-w-none space-y-1.5 sm:max-w-xs">
          <Label htmlFor="costoTotal" className={labelClass}>Costo total (USD)</Label>
          <Input
            id="costoTotal"
            type="number"
            min={0}
            step={0.01}
            className={inputClass}
            value={form.costoTotal}
            onChange={(e) => set("costoTotal", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contenidoResumen" className={labelClass}>Resumen del contenido</Label>
          <Textarea
            id="contenidoResumen"
            className="border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
            value={form.contenidoResumen}
            onChange={(e) => set("contenidoResumen", e.target.value)}
            placeholder="Ej: 500 unidades producto A, 200 unidades producto B..."
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notas" className={labelClass}>Notas adicionales</Label>
          <Textarea
            id="notas"
            className="border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
            value={form.notas}
            onChange={(e) => set("notas", e.target.value)}
            placeholder="Observaciones sobre el envío, acuerdos especiales, etc."
            rows={3}
          />
        </div>
      </section>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={loading}
          className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {loading ? "Guardando..." : containerId ? "Guardar cambios" : "Crear container"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full border-gray-200 text-sm text-gray-900 sm:w-auto"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
