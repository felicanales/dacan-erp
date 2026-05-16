import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ReunionForm } from "@/components/reuniones/ReunionForm";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  timezone: string;
};

type Reunion = {
  id: string;
  titulo: string;
  fecha: string;
  estado: "programada" | "completada" | "cancelada";
  linkVideoCall: string | null;
  notasIa: string | null;
  participantes: { usuario: Usuario }[];
};

async function getReunion(id: string): Promise<Reunion | null> {
  try {
    return await apiFetch<Reunion>(`/api/reuniones/${id}`);
  } catch {
    return null;
  }
}

async function getUsuarios(): Promise<Usuario[]> {
  try {
    return await apiFetch<Usuario[]>("/api/usuarios");
  } catch {
    return [];
  }
}

function toDateTimeLocal(iso: string) {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function mergeUsuarios(usuarios: Usuario[], reunion: Reunion) {
  const byId = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

  for (const { usuario } of reunion.participantes) {
    if (!byId.has(usuario.id)) {
      byId.set(usuario.id, usuario);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es")
  );
}

export default async function EditarReunionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reunion, usuarios] = await Promise.all([getReunion(id), getUsuarios()]);

  if (!reunion) notFound();

  const usuariosDisponibles = mergeUsuarios(usuarios, reunion);

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <Link
          href={`/reuniones/${reunion.id}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Reunion
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Editar reunion</h1>
        <p className="mt-1 text-sm text-gray-500">
          Actualiza datos basicos, participantes, estado, enlace y notas IA.
        </p>
      </div>

      <ReunionForm
        usuarios={usuariosDisponibles}
        reunionId={reunion.id}
        defaultValues={{
          titulo: reunion.titulo,
          fecha: toDateTimeLocal(reunion.fecha),
          estado: reunion.estado,
          linkVideoCall: reunion.linkVideoCall ?? "",
          notasIa: reunion.notasIa ?? "",
          participantes: reunion.participantes.map(({ usuario }) => usuario.id),
        }}
      />
    </div>
  );
}
