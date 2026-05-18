import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { FormularioPago } from "@/components/finanzas/FormularioPago";
import type { Pago } from "@/components/finanzas/finanzas-utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getPago(id: string) {
  try {
    return await apiFetch<Pago>(`/api/finanzas/pagos/${id}`);
  } catch {
    return null;
  }
}

export default async function EditarPagoPage({ params }: PageProps) {
  const { id } = await params;
  const pago = await getPago(id);

  if (!pago) notFound();

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/finanzas/pagos"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Pagos
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Editar pago</h1>
        <p className="mt-1 text-sm text-gray-500">{pago.nombre}</p>
      </div>
      <FormularioPago defaultValues={pago} pagoId={pago.id} />
    </div>
  );
}
