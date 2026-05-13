"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  timezone: string;
};

type ParticipantesSelectProps = {
  usuarios: Usuario[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onUsuarioCreated: (usuario: Usuario) => void;
};

export function ParticipantesSelect({
  usuarios,
  selectedIds,
  onChange,
  onUsuarioCreated,
}: ParticipantesSelectProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    timezone: "America/Santiago",
  });

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  async function createUsuario() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al crear participante");
      }

      const created = (await res.json()) as Usuario;
      onUsuarioCreated(created);
      onChange([...new Set([...selectedIds, created.id])]);
      setNewUser({
        nombre: "",
        email: "",
        timezone: "America/Santiago",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear participante");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      {usuarios.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {usuarios.map((usuario) => {
            const selected = selectedIds.includes(usuario.id);
            return (
              <label
                key={usuario.id}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  selected
                    ? "border-blue-200 bg-blue-50 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(usuario.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                  {usuario.nombre.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{usuario.nombre}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {usuario.timezone}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aun no hay participantes registrados.</p>
      )}

      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
        <p className="mb-3 text-sm font-medium text-gray-900">Agregar participante</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_180px_auto]">
          <Input
            className="h-9 border-gray-200 bg-white text-sm"
            value={newUser.nombre}
            onChange={(event) =>
              setNewUser((prev) => ({ ...prev, nombre: event.target.value }))
            }
            placeholder="Nombre"
          />
          <Input
            className="h-9 border-gray-200 bg-white text-sm"
            type="email"
            value={newUser.email}
            onChange={(event) =>
              setNewUser((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="correo@empresa.com"
          />
          <Input
            className="h-9 border-gray-200 bg-white text-sm"
            value={newUser.timezone}
            onChange={(event) =>
              setNewUser((prev) => ({ ...prev, timezone: event.target.value }))
            }
            placeholder="America/Santiago"
          />
          <Button
            type="button"
            variant="outline"
            className="h-9 border-gray-200 bg-white text-sm"
            onClick={createUsuario}
            disabled={creating || !newUser.nombre || !newUser.email}
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Agregar
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
