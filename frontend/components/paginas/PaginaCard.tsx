"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  FolderInput,
  FolderMinus,
  Pencil,
  GripVertical,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Carpeta = {
  id: string;
  nombre: string;
  icono: string | null;
};

type Props = {
  id: string;
  nombre: string | null;
  titulo: string;
  icono: string | null;
  carpetaId: string | null;
  updatedAt: string;
  carpetas: Carpeta[];
};

function formatFecha(iso: string) {
  const date = new Date(iso);
  const ahora = new Date();
  const diff = ahora.getTime() - date.getTime();
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 1) return "Justo ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export function PaginaCard({ id, nombre, titulo, icono, carpetaId, updatedAt, carpetas }: Props) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [renombrando, setRenombrando] = useState(false);
  const [nombreEdit, setNombreEdit] = useState(nombre ?? titulo ?? "");
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    if (menuAbierto) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuAbierto]);

  useEffect(() => {
    if (renombrando) inputRef.current?.select();
  }, [renombrando]);

  async function moverACarpeta(nuevaCarpetaId: string | null) {
    setMoviendo(true);
    setMenuAbierto(false);
    try {
      await fetch(`/api/paginas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carpetaId: nuevaCarpetaId }),
      });
      router.refresh();
    } finally {
      setMoviendo(false);
    }
  }

  async function guardarNombre() {
    const nuevo = nombreEdit.trim();
    // Si vacío o igual al titulo, borramos el nombre (vuelve a mostrar titulo)
    const valorFinal = nuevo === "" || nuevo === titulo ? null : nuevo;
    setGuardandoNombre(true);
    try {
      await fetch(`/api/paginas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: valorFinal }),
      });
      router.refresh();
    } finally {
      setGuardandoNombre(false);
      setRenombrando(false);
    }
  }

  async function eliminarArchivo() {
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/paginas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      setShowDelete(false);
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar el archivo");
    } finally {
      setDeleting(false);
    }
  }

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("pagina/id", id);
    e.dataTransfer.effectAllowed = "move";
    setArrastrando(true);
  }

  function onDragEnd() {
    setArrastrando(false);
  }

  const etiqueta = nombre || titulo || "Sin título";
  const tieneNombrePersonalizado = !!nombre && nombre !== titulo;
  const carpetasDestino = carpetas.filter((c) => c.id !== carpetaId);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 transition-all",
        arrastrando
          ? "opacity-40 scale-95 cursor-grabbing"
          : "hover:border-gray-300 hover:bg-gray-50 cursor-grab active:cursor-grabbing"
      )}
    >
      {/* Handle de arrastre visible al hover */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
        <GripVertical className="h-4 w-4" />
      </div>

      {renombrando ? (
        /* ─── Modo rename ─── */
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{icono || "📄"}</span>
            <input
              ref={inputRef}
              type="text"
              value={nombreEdit}
              onChange={(e) => setNombreEdit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") guardarNombre();
                if (e.key === "Escape") {
                  setNombreEdit(nombre ?? titulo ?? "");
                  setRenombrando(false);
                }
              }}
              placeholder={titulo || "Nombre del archivo"}
              className="flex-1 rounded border border-blue-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 outline-none ring-2 ring-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={guardarNombre}
              disabled={guardandoNombre}
              className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {guardandoNombre ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={() => {
                setNombreEdit(nombre ?? titulo ?? "");
                setRenombrando(false);
              }}
              className="rounded px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
          {tieneNombrePersonalizado && (
            <p className="text-xs text-gray-400">
              Título del documento: <span className="italic">{titulo}</span>
            </p>
          )}
        </div>
      ) : (
        /* ─── Modo normal ─── */
        <Link href={`/paginas/${id}`} className="flex flex-1 flex-col gap-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none">{icono || "📄"}</span>
            <div className="flex-1 pr-6">
              <h2 className="text-sm font-medium leading-snug text-gray-900 group-hover:text-blue-600 transition-colors">
                {etiqueta}
              </h2>
              {tieneNombrePersonalizado && (
                <p className="mt-0.5 text-xs text-gray-400 italic truncate">{titulo}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">Editado {formatFecha(updatedAt)}</p>
        </Link>
      )}

      {/* Menú de acciones */}
      {!renombrando && (
        <div ref={menuRef} className="absolute right-3 top-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuAbierto((v) => !v);
            }}
            disabled={moviendo}
            className="flex h-7 w-7 items-center justify-center rounded opacity-100 transition-opacity hover:bg-gray-100 disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>

          {menuAbierto && (
            <div className="absolute right-0 top-8 z-20 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setNombreEdit(nombre ?? titulo ?? "");
                  setMenuAbierto(false);
                  setRenombrando(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-gray-400" />
                Renombrar archivo
              </button>

              {(carpetasDestino.length > 0 || carpetaId) && (
                <div className="my-1 border-t border-gray-100" />
              )}

              {carpetasDestino.length > 0 && (
                <>
                  <p className="px-3 py-1.5 text-xs font-medium text-gray-400">Mover a carpeta</p>
                  {carpetasDestino.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => moverACarpeta(c.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FolderInput className="h-4 w-4 text-gray-400" />
                      {c.icono ? `${c.icono} ` : ""}{c.nombre}
                    </button>
                  ))}
                </>
              )}

              {carpetaId && (
                <button
                  onClick={() => moverACarpeta(null)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                >
                  <FolderMinus className="h-4 w-4 text-gray-400" />
                  Quitar de carpeta
                </button>
              )}

              {carpetasDestino.length === 0 && !carpetaId && (
                <p className="px-3 py-2 text-sm text-gray-400">No hay carpetas</p>
              )}

              <div className="my-1 border-t border-gray-100" />

              <button
                onClick={() => {
                  setMenuAbierto(false);
                  setShowDelete(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
                Eliminar archivo
              </button>
            </div>
          )}
        </div>
      )}

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
            <h3 className="mb-2 text-base font-semibold text-gray-900">Eliminar archivo</h3>
            <p className="mb-4 text-sm text-gray-500">
              Se eliminara "{etiqueta}". Esta accion no se puede deshacer.
            </p>
            {deleteError && <p className="mb-4 text-sm text-red-600">{deleteError}</p>}
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
                onClick={eliminarArchivo}
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
    </div>
  );
}
