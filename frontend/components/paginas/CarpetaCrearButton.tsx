"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function CarpetaCrearButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [abierto, setAbierto] = useState(false);

  async function handleCrear() {
    const n = nombre.trim() || "Nueva carpeta";
    setLoading(true);
    try {
      await fetch("/api/carpetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: n }),
      });
      setNombre("");
      setAbierto(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-full gap-2 text-sm sm:w-auto"
        )}
      >
        <FolderPlus className="h-4 w-4" />
        Nueva carpeta
      </button>
    );
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <input
        autoFocus
        type="text"
        placeholder="Nombre de la carpeta"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCrear();
          if (e.key === "Escape") setAbierto(false);
        }}
        className="h-9 flex-1 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-48 sm:flex-none"
      />
      <button
        onClick={handleCrear}
        disabled={loading}
        className={cn(buttonVariants(), "h-9 text-sm disabled:opacity-60")}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear"}
      </button>
      <button
        onClick={() => setAbierto(false)}
        className="text-sm text-gray-400 hover:text-gray-600"
      >
        Cancelar
      </button>
    </div>
  );
}
