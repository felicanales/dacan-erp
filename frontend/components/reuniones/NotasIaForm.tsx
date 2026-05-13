"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  reunionId: string;
  defaultNotasIa: string | null;
};

export function NotasIaForm({ reunionId, defaultNotasIa }: Props) {
  const router = useRouter();
  const [notasIa, setNotasIa] = useState(defaultNotasIa ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveNotasIa() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/reuniones/${reunionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notasIa: notasIa || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar notas IA");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar notas IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Notas de IA</h2>
        <p className="mt-1 text-xs text-gray-500">
          Espacio para transcripcion, resumen automatico o apuntes generados por IA.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notasIa" className="text-sm font-medium text-gray-900">
          Notas capturadas
        </Label>
        <Textarea
          id="notasIa"
          className="min-h-44 resize-y border-gray-200 bg-white text-sm text-gray-900 focus-visible:ring-1 focus-visible:ring-blue-500"
          value={notasIa}
          onChange={(event) => setNotasIa(event.target.value)}
          placeholder="La IA puede dejar aqui la transcripcion, puntos clave, decisiones y pendientes detectados."
        />
      </div>
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <Button
        type="button"
        onClick={saveNotasIa}
        disabled={loading}
        className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar notas IA
      </Button>
    </section>
  );
}
