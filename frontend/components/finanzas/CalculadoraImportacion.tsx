"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResultadoCostoImportacion } from "./types";
import { formatCLP } from "./finanzas-utils";

type FormState = {
  fob: string;
  flete: string;
  seguro: string;
  arancel: string;
  iva: string;
  costosLocales: string;
  cantidadUnidades: string;
};

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

function numberFromInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function CalculadoraImportacion() {
  const [form, setForm] = useState<FormState>({
    fob: "",
    flete: "",
    seguro: "",
    arancel: "0.06",
    iva: "0.19",
    costosLocales: "",
    cantidadUnidades: "",
  });
  const [resultado, setResultado] = useState<ResultadoCostoImportacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      fob: numberFromInput(form.fob),
      flete: numberFromInput(form.flete),
      seguro: numberFromInput(form.seguro),
      arancel: numberFromInput(form.arancel),
      iva: numberFromInput(form.iva),
      costosLocales: numberFromInput(form.costosLocales),
      cantidadUnidades: form.cantidadUnidades
        ? numberFromInput(form.cantidadUnidades)
        : undefined,
    }),
    [form]
  );

  useEffect(() => {
    if (!payload.fob && !payload.flete && !payload.seguro) {
      setResultado(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch("/api/finanzas/costos-importacion/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Error al calcular");
        }
        return res.json() as Promise<ResultadoCostoImportacion>;
      })
      .then(setResultado)
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Error al calcular");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [payload]);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Variables de importacion</h2>
          <p className="mt-1 text-xs text-gray-500">
            Calcula CIF, arancel, IVA, total puesto en Chile y costo unitario.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["fob", "FOB"],
            ["flete", "Flete"],
            ["seguro", "Seguro"],
            ["costosLocales", "Costos locales"],
            ["cantidadUnidades", "Cantidad unidades"],
          ].map(([field, label]) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field}>{label}</Label>
              <Input
                id={field}
                type="number"
                min={0}
                step={1}
                className={inputClass}
                value={form[field as keyof FormState]}
                onChange={(event) =>
                  update(field as keyof FormState, event.target.value)
                }
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <Label htmlFor="arancel">Arancel</Label>
            <Input
              id="arancel"
              type="number"
              min={0}
              max={1}
              step={0.01}
              className={inputClass}
              value={form.arancel}
              onChange={(event) => update("arancel", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="iva">IVA</Label>
            <Input
              id="iva"
              type="number"
              min={0}
              max={1}
              step={0.01}
              className={inputClass}
              value={form.iva}
              onChange={(event) => update("iva", event.target.value)}
            />
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Resultado</h2>
          {loading && <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        {!resultado ? (
          <p className="mt-4 text-sm text-gray-500">
            Ingresa valores para ver el calculo en tiempo real.
          </p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            {[
              ["CIF", formatCLP(resultado.cif)],
              ["Arancel", formatCLP(resultado.montoArancel)],
              ["Base IVA", formatCLP(resultado.baseIva)],
              ["IVA", formatCLP(resultado.montoIva)],
              ["Impuestos", formatCLP(resultado.totalImpuestos)],
              ["Total importado", formatCLP(resultado.totalImportado)],
              [
                "Costo unitario",
                resultado.costoUnitario ? formatCLP(resultado.costoUnitario) : "-",
              ],
              ["Factor", `${resultado.factorMultiplicador.toFixed(2)}x`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 last:border-b-0"
              >
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}

            <Button
              type="button"
              disabled
              variant="outline"
              className="mt-2 w-full text-xs text-gray-500"
            >
              Guardar calculo proximo paso
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
