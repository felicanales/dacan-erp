"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductActionsProps = {
  productoId: string;
  productoNombre: string;
  archivado?: boolean;
};

export function ProductActions({
  productoId,
  productoNombre,
  archivado,
}: ProductActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Archivar producto "${productoNombre}"? No aparecera en el catalogo activo.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/productos/${productoId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al archivar producto");
      }
      router.push("/productos");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Error al archivar producto");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        asChild
        variant="outline"
        className="h-9 border-gray-200 text-sm text-gray-900"
      >
        <Link href={`/productos/${productoId}#editar`}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-9 border-red-200 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleDelete}
        disabled={Boolean(archivado) || deleting}
        title={archivado ? "Producto archivado" : "Archivar producto"}
      >
        {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
        Archivar
      </Button>
    </div>
  );
}
