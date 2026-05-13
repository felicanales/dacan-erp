"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParticipantesSelect } from "@/components/reuniones/ParticipantesSelect";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  timezone: string;
};

type ReunionTipo = "interna" | "con_proveedor" | "con_cliente";
type ReunionEstado = "programada" | "completada" | "cancelada";

type ReunionFormData = {
  titulo: string;
  fecha: string;
  duracionMinutos: string;
  tipo: ReunionTipo;
  estado: ReunionEstado;
  linkVideoCall: string;
  agenda: string;
  participantes: string[];
};

type Props = {
  usuarios: Usuario[];
  defaultValues?: Partial<ReunionFormData>;
  reunionId?: string;
};

const inputClass =
  "h-9 w-full border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500";

const labelClass = "text-sm font-medium text-gray-900";

function toDateTimeLocal(iso?: string | null) {
  const date = iso ? new Date(iso) : new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function ReunionForm({ usuarios, defaultValues, reunionId }: Props) {
  const router = useRouter();
  const [availableUsuarios, setAvailableUsuarios] = useState(usuarios);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ReunionFormData>({
    titulo: defaultValues?.titulo ?? "",
    fecha: defaultValues?.fecha ?? toDateTimeLocal(),
    duracionMinutos: defaultValues?.duracionMinutos ?? "60",
    tipo: defaultValues?.tipo ?? "interna",
    estado: defaultValues?.estado ?? "programada",
    linkVideoCall: defaultValues?.linkVideoCall ?? "",
    agenda: defaultValues?.agenda ?? "",
    participantes:
      defaultValues?.participantes ??
      (availableUsuarios[0] ? [availableUsuarios[0].id] : []),
  });

  function set<K extends keyof ReunionFormData>(field: K, value: ReunionFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (form.participantes.length === 0) {
      setError("Selecciona al menos un participante.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        titulo: form.titulo,
        fecha: new Date(form.fecha).toISOString(),
        duracionMinutos: form.duracionMinutos
          ? Number(form.duracionMinutos)
          : null,
        tipo: form.tipo,
        estado: form.estado,
        linkVideoCall: form.linkVideoCall || null,
        agenda: form.agenda || null,
        participantes: form.participantes,
      };

      const res = await fetch(
        reunionId ? `/api/reuniones/${reunionId}` : "/api/reuniones",
        {
          method: reunionId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar reunion");
      }

      const saved = (await res.json()) as { id: string };
      router.push(`/reuniones/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salio mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Datos basicos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="titulo" className={labelClass}>
              Titulo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="titulo"
              className={inputClass}
              value={form.titulo}
              onChange={(event) => set("titulo", event.target.value)}
              placeholder="Ej: Revision semanal operaciones"
              required
              minLength={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha" className={labelClass}>
              Fecha y hora <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha"
              type="datetime-local"
              className={inputClass}
              value={form.fecha}
              onChange={(event) => set("fecha", event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duracion" className={labelClass}>Duracion (min)</Label>
            <Input
              id="duracion"
              type="number"
              min={1}
              className={inputClass}
              value={form.duracionMinutos}
              onChange={(event) => set("duracionMinutos", event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(value) => set("tipo", value as ReunionTipo)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interna">Interna</SelectItem>
                <SelectItem value="con_proveedor">Con proveedor</SelectItem>
                <SelectItem value="con_cliente">Con cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Estado</Label>
            <Select
              value={form.estado}
              onValueChange={(value) => set("estado", value as ReunionEstado)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="programada">Programada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkVideoCall" className={labelClass}>Link videollamada</Label>
            <Input
              id="linkVideoCall"
              type="url"
              className={inputClass}
              value={form.linkVideoCall}
              onChange={(event) => set("linkVideoCall", event.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Participantes</h2>
        <ParticipantesSelect
          usuarios={availableUsuarios}
          selectedIds={form.participantes}
          onChange={(ids) => set("participantes", ids)}
          onUsuarioCreated={(usuario) => {
            setAvailableUsuarios((prev) => [...prev, usuario]);
          }}
        />
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">Agenda</h2>
        <Textarea
          className="min-h-36 resize-y border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
          value={form.agenda}
          onChange={(event) => set("agenda", event.target.value)}
          placeholder={"1. Revision estado containers\n2. Avance ventas B2B\n3. Proximos pasos"}
        />
      </section>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={loading}
          className="h-9 w-full bg-blue-500 text-sm text-white hover:bg-blue-600 sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Guardando..." : reunionId ? "Guardar cambios" : "Agendar reunion"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full border-gray-200 text-sm text-gray-900 sm:w-auto"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
