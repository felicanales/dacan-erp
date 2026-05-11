import { Package, Building2, Users, ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const kpiCards = [
  {
    label: "Productos en catálogo",
    value: "—",
    sub: "stock total pendiente",
    icon: Package,
    href: "/productos",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    label: "Containers activos",
    value: "—",
    sub: "en tránsito o aduana",
    icon: Package,
    href: "/containers",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    label: "Clientes B2B",
    value: "—",
    sub: "relaciones activas",
    icon: Users,
    href: "/clientes/b2b",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    label: "Pedidos este mes",
    value: "—",
    sub: "confirmados y despachados",
    icon: ShoppingCart,
    href: "/pedidos",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
];

const modulos = [
  { label: "Autenticación y roles", done: true, href: null },
  { label: "Base de datos", done: true, href: null },
  { label: "Proveedores", done: true, href: "/proveedores" },
  { label: "Containers", done: true, href: "/containers" },
  { label: "Catálogo de Productos", done: false, href: null },
  { label: "Inventario", done: false, href: null },
  { label: "Clientes B2B / B2C", done: false, href: null },
  { label: "Pedidos", done: false, href: null },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Panel de control</h1>
          <p className="mt-1 text-sm text-gray-500">
            Resumen general del sistema Dacan ERP
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Sistema operativo
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, value, sub, icon: Icon, href, color, bg, border }) => (
          <Link
            key={label}
            href={href}
            className={`group bg-white rounded-xl border ${border} p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Estado de construcción */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Módulos del sistema</h2>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
              {modulos.filter((m) => m.done).length} / {modulos.length} listos
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${(modulos.filter((m) => m.done).length / modulos.length) * 100}%`,
              }}
            />
          </div>

          <ul className="space-y-2">
            {modulos.map(({ label, done, href }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                    done
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  {done ? (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  )}
                </span>
                {href && done ? (
                  <Link
                    href={href}
                    className="text-gray-900 hover:underline font-medium"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className={done ? "text-gray-900 font-medium" : "text-gray-400"}>
                    {label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Accesos rápidos</h2>
          <div className="space-y-2">
            {[
              { label: "Nuevo proveedor", href: "/proveedores/nuevo", icon: Building2 },
              { label: "Nuevo container", href: "/containers/nuevo", icon: Package },
              {
                label: "Ver todos los containers",
                href: "/containers",
                icon: TrendingUp,
              },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
              >
                <Icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                {label}
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
