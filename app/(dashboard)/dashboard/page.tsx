import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        Bienvenido, {user?.firstName ?? "usuario"}
      </h1>
      <p className="mt-1 text-gray-500">Dacan Global Trading — Panel de control</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Productos" value="—" />
        <StatCard label="Containers activos" value="—" />
        <StatCard label="Clientes B2B" value="—" />
        <StatCard label="Pedidos este mes" value="—" />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
