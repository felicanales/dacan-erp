import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ReunionForm } from "@/components/reuniones/ReunionForm";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  timezone: string;
};

async function getUsuarios(): Promise<Usuario[]> {
  try {
    return await apiFetch<Usuario[]>("/api/usuarios");
  } catch {
    return [];
  }
}

export default async function NuevaReunionPage() {
  const usuarios = await getUsuarios();

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <Link
          href="/reuniones"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Reuniones
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nueva reunion</h1>
        <p className="mt-1 text-sm text-gray-500">
          Agenda una reunion y deja lista la pauta para el equipo.
        </p>
      </div>

      <ReunionForm usuarios={usuarios} />
    </div>
  );
}
