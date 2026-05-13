"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function PaginaCrearButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCrear() {
    setLoading(true);
    try {
      const res = await fetch("/api/paginas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: "Sin título" }),
      });
      if (res.ok) {
        const pagina = await res.json();
        router.push(`/paginas/${pagina.id}`);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCrear}
      disabled={loading}
      className={cn(
        buttonVariants(),
        "h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto disabled:opacity-60"
      )}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {loading ? "Creando..." : "+ Nueva página"}
    </button>
  );
}
