"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProveedorActionsProps = {
  proveedorId: string;
  proveedorNombre: string;
  canDelete: boolean;
};

export function ProveedorActions({
  proveedorId,
  proveedorNombre,
  canDelete,
}: ProveedorActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Eliminar proveedor "${proveedorNombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/proveedores/${proveedorId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al eliminar proveedor");
      }
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Error al eliminar proveedor");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        asChild
        variant="outline"
        size="icon-sm"
        className="border-gray-200 text-gray-600 hover:text-gray-900"
        aria-label="Ver información completa"
      >
        <Link href={`/proveedores/${proveedorId}#editar`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="icon-sm"
        className="border-gray-200 text-gray-600 hover:text-gray-900"
        aria-label="Editar proveedor"
      >
        <Link href={`/proveedores/${proveedorId}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleDelete}
        disabled={!canDelete || deleting}
        title={canDelete ? "Eliminar proveedor" : "No se puede eliminar con productos o containers asociados"}
        aria-label="Eliminar proveedor"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
