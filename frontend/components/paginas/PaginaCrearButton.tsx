"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  carpetaId?: string;
};

export function PaginaCrearButton({ carpetaId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCrear() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/paginas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "Sin título",
          carpetaId: carpetaId ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      const pagina = await res.json();
      router.push(`/paginas/${pagina.id}`);
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la página");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <button
        onClick={handleCrear}
        disabled={loading}
        className={cn(
          buttonVariants(),
          "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto disabled:opacity-60"
        )}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Creando..." : "+ Nueva página"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
