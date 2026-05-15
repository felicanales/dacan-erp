"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Folder } from "lucide-react";
import { CarpetaEliminarButton } from "@/components/paginas/CarpetaEliminarButton";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  nombre: string;
  icono: string | null;
  count: number;
};

export function CarpetaCard({ id, nombre, icono, count }: Props) {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [soltando, setSoltando] = useState(false);

  function onDragOver(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes("pagina/id")) return;
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave(e: React.DragEvent) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const paginaId = e.dataTransfer.getData("pagina/id");
    if (!paginaId) return;
    setSoltando(true);
    try {
      await fetch(`/api/paginas/${paginaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carpetaId: id }),
      });
      router.refresh();
    } finally {
      setSoltando(false);
    }
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "group relative rounded-lg border bg-white transition-all",
        dragOver
          ? "scale-[1.02] border-blue-400 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
        soltando && "opacity-60"
      )}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg">
          <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow">
            Soltar aqui
          </span>
        </div>
      )}

      <Link href={`/paginas?carpeta=${id}`} className="flex items-center gap-3 p-4 pr-12">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-amber-50 text-lg">
          {icono || <Folder className="h-5 w-5 text-amber-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600">
            {nombre}
          </p>
          <p className="text-xs text-gray-400">
            {count} {count === 1 ? "documento" : "documentos"}
          </p>
        </div>
      </Link>

      <CarpetaEliminarButton
        id={id}
        nombre={nombre}
        count={count}
        variant="icon"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
      />
    </div>
  );
}
