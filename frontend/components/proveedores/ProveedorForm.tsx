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

const MONEDAS = ["USD", "EUR", "CNY", "CLP", "BRL", "GBP"];

type ProveedorFormData = {
  nombre: string;
  pais: string;
  ciudad: string;
  contactoNombre: string;
  contactoEmail: string;
  contactoTelefono: string;
  moneda: string;
  condicionesPago: string;
  notas: string;
};

type Props = {
  defaultValues?: Partial<ProveedorFormData>;
  proveedorId?: string;
};

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

const labelClass = "text-sm font-medium text-gray-900";

export function ProveedorForm({ defaultValues, proveedorId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [form, setForm] = useState<ProveedorFormData>({
    nombre:           defaultValues?.nombre           ?? "",
    pais:             defaultValues?.pais             ?? "",
    ciudad:           defaultValues?.ciudad           ?? "",
    contactoNombre:   defaultValues?.contactoNombre   ?? "",
    contactoEmail:    defaultValues?.contactoEmail    ?? "",
    contactoTelefono: defaultValues?.contactoTelefono ?? "",
    moneda:           defaultValues?.moneda           ?? "USD",
    condicionesPago:  defaultValues?.condicionesPago  ?? "",
    notas:            defaultValues?.notas            ?? "",
  });

  function set(field: keyof ProveedorFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url    = proveedorId ? `/api/proveedores/${proveedorId}` : "/api/proveedores";
      const method = proveedorId ? "PUT" : "POST";
      const res    = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"}${url}`,
        { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar");
      }
      router.push("/proveedores");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos del proveedor */}
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Datos del proveedor</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className={labelClass}>
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              className={inputClass}
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: Proveedor Asia S.A."
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pais" className={labelClass}>
              País <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pais"
              className={inputClass}
              value={form.pais}
              onChange={(e) => set("pais", e.target.value)}
              placeholder="Ej: China"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ciudad" className={labelClass}>Ciudad</Label>
            <Input
              id="ciudad"
              className={inputClass}
              value={form.ciudad}
              onChange={(e) => set("ciudad", e.target.value)}
              placeholder="Ej: Guangzhou"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="moneda" className={labelClass}>Moneda</Label>
            <Select value={form.moneda} onValueChange={(v) => set("moneda", v ?? "USD")}>
              <SelectTrigger id="moneda" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONEDAS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="condicionesPago" className={labelClass}>Condiciones de pago</Label>
            <Input
              id="condicionesPago"
              className={inputClass}
              value={form.condicionesPago}
              onChange={(e) => set("condicionesPago", e.target.value)}
              placeholder="Ej: 30% adelanto, 70% contra BL"
            />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Contacto principal</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contactoNombre" className={labelClass}>Nombre</Label>
            <Input
              id="contactoNombre"
              className={inputClass}
              value={form.contactoNombre}
              onChange={(e) => set("contactoNombre", e.target.value)}
              placeholder="Nombre del contacto"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactoEmail" className={labelClass}>Correo electrónico</Label>
            <Input
              id="contactoEmail"
              type="email"
              className={inputClass}
              value={form.contactoEmail}
              onChange={(e) => set("contactoEmail", e.target.value)}
              placeholder="contacto@proveedor.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactoTelefono" className={labelClass}>Teléfono / WhatsApp</Label>
            <Input
              id="contactoTelefono"
              className={inputClass}
              value={form.contactoTelefono}
              onChange={(e) => set("contactoTelefono", e.target.value)}
              placeholder="+86 123 456 789"
            />
          </div>
        </div>
      </section>

      {/* Notas */}
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Notas de negociación</h2>
        <Textarea
          className="border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Información sobre la relación comercial, acuerdos previos, etc."
          rows={4}
        />
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
          {loading ? "Guardando..." : proveedorId ? "Guardar cambios" : "Crear proveedor"}
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
