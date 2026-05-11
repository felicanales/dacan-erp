import { SignOutButton } from "@clerk/nextjs";

export default function NoAutorizadoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Acceso no autorizado</h1>
        <p className="text-gray-500">
          Tu cuenta no tiene permiso para acceder al sistema de Dacan.
        </p>
        <p className="text-sm text-gray-400">
          Contacta a Felipe si crees que esto es un error.
        </p>
        <SignOutButton>
          <button className="mt-4 text-sm text-blue-600 hover:underline">
            Cerrar sesión
          </button>
        </SignOutButton>
      </div>
    </main>
  );
}
