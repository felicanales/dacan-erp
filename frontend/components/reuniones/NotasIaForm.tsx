"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownNotes } from "@/components/reuniones/MarkdownNotes";

type Props = {
  reunionId: string;
  defaultNotasIa: string | null;
};

export function NotasIaForm({ reunionId, defaultNotasIa }: Props) {
  const router = useRouter();
  const [savedNotasIa, setSavedNotasIa] = useState(defaultNotasIa ?? "");
  const [notasIa, setNotasIa] = useState(defaultNotasIa ?? "");
  const [editing, setEditing] = useState(!(defaultNotasIa ?? "").trim());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = defaultNotasIa ?? "";
    setSavedNotasIa(next);
    setNotasIa(next);
    setEditing(!next.trim());
  }, [defaultNotasIa]);

  async function saveNotasIa() {
    setError(null);
    setLoading(true);
    try {
      const value = notasIa.trim() ? notasIa : null;
      const res = await fetch(`/api/reuniones/${reunionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notasIa: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar notas IA");
      }

      setSavedNotasIa(value ?? "");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar notas IA");
    } finally {
      setLoading(false);
    }
  }

  function cancelEdit() {
    setNotasIa(savedNotasIa);
    setError(null);
    setEditing(!savedNotasIa.trim());
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Notas IA</h2>
          <p className="mt-1 text-xs text-gray-500">
            Pega el resumen de Fathom en Markdown; se renderiza con títulos, listas y enlaces.
          </p>
        </div>

        {!editing && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
            className="h-9 w-full gap-2 text-sm sm:w-auto"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="notasIa" className="text-sm font-medium text-gray-900">
              Markdown de Fathom
            </Label>
            <Textarea
              id="notasIa"
              className="min-h-[360px] resize-y border-gray-200 bg-white font-mono text-sm leading-6 text-gray-900 focus-visible:ring-1 focus-visible:ring-blue-500"
              value={notasIa}
              onChange={(event) => setNotasIa(event.target.value)}
              placeholder={"# Título\n\n[VIEW RECORDING](https://...)\n\n## Puntos clave\n\n- **Tema importante.** Detalle con contexto."}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={saveNotasIa}
              disabled={loading}
              className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar notas
            </Button>
            {savedNotasIa.trim() && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={loading}
                className="h-9 w-full text-sm sm:w-auto"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-white px-1 py-1 sm:px-2">
          <MarkdownNotes content={savedNotasIa} />
        </div>
      )}
    </section>
  );
}
