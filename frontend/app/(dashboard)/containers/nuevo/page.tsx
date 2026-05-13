import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ContainerForm } from "@/components/containers/ContainerForm";

export default async function NuevoContainerPage() {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/containers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Containers
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo container</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registra el seguimiento de un nuevo envío.
        </p>
      </div>
      <ContainerForm />
    </div>
  );
}
