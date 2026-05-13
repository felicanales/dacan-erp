"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  reunionId: string;
  defaultActa: string | null;
  defaultAcuerdos: string | null;
  actaEnviada: boolean;
  actaEnviadaAt: string | null;
};

export function ActaForm({
  reunionId,
  defaultActa,
  defaultAcuerdos,
  actaEnviada,
  actaEnviadaAt,
}: Props) {
  const router = useRouter();
  const [acta, setActa] = useState(defaultActa ?? "");
  const [acuerdos, setAcuerdos] = useState(defaultAcuerdos ?? "");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persistActa() {
    const res = await fetch(`/api/reuniones/${reunionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acta: acta || null,
        acuerdos: acuerdos || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Error al guardar acta");
    }
  }

  async function saveActa() {
    setError(null);
    setLoading(true);
    try {
      await persistActa();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar acta");
    } finally {
      setLoading(false);
    }
  }

  async function saveAndSend() {
    setError(null);
    setSending(true);
    try {
      await persistActa();
      const res = await fetch(`/api/reuniones/${reunionId}/enviar-acta`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al enviar acta");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar acta");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Acta post-reunion</h2>
          {actaEnviada && (
            <p className="mt-1 text-xs text-emerald-700">
              Acta enviada
              {actaEnviadaAt
                ? ` / ${new Date(actaEnviadaAt).toLocaleDateString("es-CL")}`
                : ""}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acta" className="text-sm font-medium text-gray-900">
          Resumen discutido
        </Label>
        <Textarea
          id="acta"
          className="min-h-36 resize-y border-gray-200 bg-white text-sm text-gray-900 focus-visible:ring-1 focus-visible:ring-blue-500"
          value={acta}
          onChange={(event) => setActa(event.target.value)}
          placeholder="Resumen de lo conversado, decisiones y contexto relevante."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acuerdos" className="text-sm font-medium text-gray-900">
          Acuerdos y compromisos
        </Label>
        <Textarea
          id="acuerdos"
          className="min-h-32 resize-y border-gray-200 bg-white text-sm text-gray-900 focus-visible:ring-1 focus-visible:ring-blue-500"
          value={acuerdos}
          onChange={(event) => setAcuerdos(event.target.value)}
          placeholder="1. Responsable - compromiso - fecha esperada"
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={saveActa}
          disabled={loading || sending}
          className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar acta
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={saveAndSend}
          disabled={loading || sending || actaEnviada}
          className="h-9 w-full border-gray-200 text-sm text-gray-900 sm:w-auto"
        >
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Guardar y marcar enviada
        </Button>
      </div>
    </section>
  );
}
