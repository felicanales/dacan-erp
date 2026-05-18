"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/finanzas/finanzas-utils";
import { cn } from "@/lib/utils";

const ALL = "todos";

const VIEW_OPTIONS = [
  { value: ALL, label: "Pagos" },
  { value: "suscripcion", label: "Suscripciones" },
  { value: "otros", label: "Otros pagos" },
] as const;

const selectClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 focus-visible:ring-1 focus-visible:ring-blue-500";

type FiltroPagosProps = {
  total: number;
};

export function FiltroPagos({ total }: FiltroPagosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tipo = searchParams.get("tipo") ?? ALL;
  const estado = searchParams.get("estado") ?? ALL;
  const categoria = searchParams.get("categoria") ?? ALL;
  const duenioTarjeta = searchParams.get("duenioTarjeta") ?? ALL;
  const mes = searchParams.get("mes") ?? "";
  const activeView = tipo === "suscripcion" || tipo === "otros" ? tipo : ALL;
  const hasFilters = [tipo, estado, categoria, duenioTarjeta].some((value) => value !== ALL) || mes;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function clearFilters() {
    router.replace(pathname);
  }

  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParam("tipo", option.value)}
              className={cn(
                "h-8 flex-1 rounded-md px-3 text-sm font-medium text-gray-500 transition-colors sm:flex-none",
                activeView === option.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "hover:bg-white/70 hover:text-gray-900"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
          <span>{total} registros</span>
          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              className="h-8 border-gray-200 text-xs text-gray-600"
              onClick={clearFilters}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <Select value={estado} onValueChange={(value) => updateParam("estado", value ?? ALL)}>
          <SelectTrigger className={selectClass} aria-label="Estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Estado</SelectItem>
            {ESTADO_PAGO_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoria}
          onValueChange={(value) => updateParam("categoria", value ?? ALL)}
        >
          <SelectTrigger className={selectClass} aria-label="Categoria">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Categoria</SelectItem>
            {CATEGORIA_FINANZAS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={duenioTarjeta}
          onValueChange={(value) => updateParam("duenioTarjeta", value ?? ALL)}
        >
          <SelectTrigger className={selectClass} aria-label="Dueno tarjeta">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Dueno tarjeta</SelectItem>
            {DUENIO_TARJETA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipo} onValueChange={(value) => updateParam("tipo", value ?? ALL)}>
          <SelectTrigger className={selectClass} aria-label="Tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tipo</SelectItem>
            {TIPO_PAGO_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="otros">Otros pagos</SelectItem>
          </SelectContent>
        </Select>

        <label className="relative block">
          <Filter className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="month"
            value={mes}
            onChange={(event) => updateParam("mes", event.target.value || null)}
            className="h-9 border-gray-200 bg-white pl-8 text-sm text-gray-900 focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Mes"
          />
        </label>
      </div>
    </section>
  );
}
