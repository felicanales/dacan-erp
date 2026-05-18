"use client";

import { useEffect, useState } from "react";
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
import {
  CATEGORIA_FINANZAS_OPTIONS,
  DUENIO_TARJETA_OPTIONS,
  ESTADO_PAGO_OPTIONS,
  TIPO_PAGO_OPTIONS,
  toDateInputValue,
  type CategoriaFinanzas,
  type DuenioTarjeta,
  type EstadoPago,
  type Pago,
  type SuscripcionResumen,
  type TipoPago,
} from "@/components/finanzas/finanzas-utils";

type PagoFormData = {
  nombre: string;
  tipoPago: TipoPago;
  monto: string;
  montoPagadoNum: string;
  fechaPago: string;
  estadoPago: EstadoPago;
  categorias: CategoriaFinanzas[];
  factura: string;
  tarjeta: string;
  duenioTarjeta: DuenioTarjeta | "";
  suscripcionId: string;
};

type FormularioPagoProps = {
  defaultValues?: Pago;
  pagoId?: string;
};

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

const labelClass = "text-sm font-medium text-gray-900";
const NO_DUENIO = "sin_duenio";
const NO_SUSCRIPCION = "sin_suscripcion";

export function FormularioPago({ defaultValues, pagoId }: FormularioPagoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suscripciones, setSuscripciones] = useState<SuscripcionResumen[]>([]);
  const [loadingSuscripciones, setLoadingSuscripciones] = useState(false);

  const [form, setForm] = useState<PagoFormData>({
    nombre: defaultValues?.nombre ?? "",
    tipoPago: defaultValues?.tipoPago ?? "gasto_unico",
    monto: defaultValues?.monto ?? "",
    montoPagadoNum:
      defaultValues?.montoPagadoNum !== null && defaultValues?.montoPagadoNum !== undefined
        ? String(defaultValues.montoPagadoNum)
        : "",
    fechaPago: toDateInputValue(defaultValues?.fechaPago),
    estadoPago: defaultValues?.estadoPago ?? "pendiente",
    categorias: defaultValues?.categorias ?? [],
    factura: defaultValues?.factura ?? "",
    tarjeta: defaultValues?.tarjeta ?? "",
    duenioTarjeta: defaultValues?.duenioTarjeta ?? "",
    suscripcionId: defaultValues?.suscripcionId ?? "",
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoadingSuscripciones(true);

    fetch("/api/finanzas/suscripciones", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al cargar suscripciones");
        return res.json() as Promise<SuscripcionResumen[]>;
      })
      .then(setSuscripciones)
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSuscripciones([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSuscripciones(false);
      });

    return () => controller.abort();
  }, []);

  function set<K extends keyof PagoFormData>(field: K, value: PagoFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateTipoPago(value: TipoPago) {
    setForm((prev) => ({
      ...prev,
      tipoPago: value,
      suscripcionId: value === "suscripcion" ? prev.suscripcionId : "",
    }));
  }

  function toggleCategoria(categoria: CategoriaFinanzas) {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter((item) => item !== categoria)
        : [...prev.categorias, categoria],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      ...form,
      montoPagadoNum: form.montoPagadoNum ? Number(form.montoPagadoNum) : null,
      fechaPago: form.fechaPago || null,
      duenioTarjeta: form.duenioTarjeta || null,
      monto: form.monto || null,
      factura: form.factura || null,
      tarjeta: form.tarjeta || null,
      suscripcionId:
        form.tipoPago === "suscripcion" && form.suscripcionId ? form.suscripcionId : null,
    };

    try {
      const url = pagoId ? `/api/finanzas/pagos/${pagoId}` : "/api/finanzas/pagos";
      const method = pagoId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar pago");
      }

      router.push("/finanzas/pagos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salio mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Datos del pago</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombre" className={labelClass}>
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              className={inputClass}
              value={form.nombre}
              onChange={(event) => set("nombre", event.target.value)}
              placeholder="Ej: Shopify mayo 2026"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipoPago" className={labelClass}>Tipo</Label>
            <Select value={form.tipoPago} onValueChange={(value) => updateTipoPago(value as TipoPago)}>
              <SelectTrigger id="tipoPago" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_PAGO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.tipoPago === "suscripcion" && (
            <div className="space-y-1.5">
              <Label htmlFor="suscripcionId" className={labelClass}>Suscripcion</Label>
              <Select
                value={form.suscripcionId || NO_SUSCRIPCION}
                onValueChange={(value) => {
                  const nextValue = value ?? NO_SUSCRIPCION;
                  set("suscripcionId", nextValue === NO_SUSCRIPCION ? "" : nextValue);
                }}
              >
                <SelectTrigger id="suscripcionId" className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SUSCRIPCION}>
                    {loadingSuscripciones ? "Cargando..." : "Sin suscripcion vinculada"}
                  </SelectItem>
                  {suscripciones.map((suscripcion) => (
                    <SelectItem key={suscripcion.id} value={suscripcion.id}>
                      {suscripcion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="estadoPago" className={labelClass}>Estado</Label>
            <Select
              value={form.estadoPago}
              onValueChange={(value) => set("estadoPago", value as EstadoPago)}
            >
              <SelectTrigger id="estadoPago" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_PAGO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monto" className={labelClass}>Monto libre</Label>
            <Input
              id="monto"
              className={inputClass}
              value={form.monto}
              onChange={(event) => set("monto", event.target.value)}
              placeholder="Ej: US$ 25 / mes"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="montoPagadoNum" className={labelClass}>Monto pagado CLP</Label>
            <Input
              id="montoPagadoNum"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              className={inputClass}
              value={form.montoPagadoNum}
              onChange={(event) => set("montoPagadoNum", event.target.value)}
              placeholder="Ej: 25000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fechaPago" className={labelClass}>Fecha de pago</Label>
            <Input
              id="fechaPago"
              type="date"
              className={inputClass}
              value={form.fechaPago}
              onChange={(event) => set("fechaPago", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="factura" className={labelClass}>Factura URL</Label>
            <Input
              id="factura"
              className={inputClass}
              value={form.factura}
              onChange={(event) => set("factura", event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Clasificacion</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIA_FINANZAS_OPTIONS.map((option) => {
            const checked = form.categorias.includes(option.value);
            return (
              <label
                key={option.value}
                className={[
                  "flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm transition-colors",
                  checked
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  checked={checked}
                  onChange={() => toggleCategoria(option.value)}
                />
                <span className="truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Medio de pago</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tarjeta" className={labelClass}>Tarjeta</Label>
            <Input
              id="tarjeta"
              className={inputClass}
              value={form.tarjeta}
              onChange={(event) => set("tarjeta", event.target.value)}
              placeholder="Ej: Visa empresa"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="duenioTarjeta" className={labelClass}>Dueno</Label>
            <Select
              value={form.duenioTarjeta || NO_DUENIO}
              onValueChange={(value) =>
                set("duenioTarjeta", value === NO_DUENIO ? "" : (value as DuenioTarjeta))
              }
            >
              <SelectTrigger id="duenioTarjeta" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_DUENIO}>Sin dueno</SelectItem>
                {DUENIO_TARJETA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={loading}
          className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Guardando..." : pagoId ? "Guardar cambios" : "Crear pago"}
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
