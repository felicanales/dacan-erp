"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  nombre: string;
  count: number;
  className?: string;
  redirectTo?: string;
  variant?: "button" | "icon";
};

export function CarpetaEliminarButton({
  id,
  nombre,
  count,
  className,
  redirectTo,
  variant = "button",
}: Props) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/carpetas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      setShowDelete(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la carpeta");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDelete(true)}
        className={cn(
          variant === "icon"
            ? "flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            : "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600",
          className
        )}
        title="Eliminar carpeta"
        aria-label="Eliminar carpeta"
      >
        <Trash2 className="h-4 w-4" />
        {variant === "button" && "Eliminar carpeta"}
      </button>

      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            if (!deleting) setShowDelete(false);
          }}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold text-gray-900">Eliminar carpeta</h3>
            <p className="mb-4 text-sm text-gray-500">
              Se eliminara "{nombre}". {count === 1 ? "La pagina" : "Las paginas"} dentro
              quedaran sin carpeta.
            </p>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
