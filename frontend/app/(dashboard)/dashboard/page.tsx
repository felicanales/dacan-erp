import Link from "next/link";
import { Package, Users, ShoppingCart, ArrowRight } from "lucide-react";

const kpiCards = [
  { label: "Productos en catálogo",  valor: "—", sub: "activos en catálogo",        icon: Package,      href: "/productos" },
  { label: "Containers activos",     valor: "—", sub: "en tránsito o aduana",       icon: Package,      href: "/containers" },
  { label: "Clientes B2B",           valor: "—", sub: "relaciones activas",          icon: Users,        href: "/clientes/b2b" },
  { label: "Pedidos este mes",       valor: "—", sub: "confirmados y despachados",   icon: ShoppingCart, href: "/pedidos" },
];

const modulos = [
  { label: "Autenticación y roles",  done: true,  href: null },
  { label: "Base de datos",          done: true,  href: null },
  { label: "Proveedores",            done: true,  href: "/proveedores" },
  { label: "Containers",             done: true,  href: "/containers" },
  { label: "Catálogo de Productos",  done: false, href: null },
  { label: "Inventario",             done: false, href: null },
  { label: "Clientes B2B / B2C",     done: false, href: null },
  { label: "Pedidos",                done: false, href: null },
];

const listos = modulos.filter((m) => m.done).length;

export default function DashboardPage() {
  return (
    <div className="w-full max-w-5xl space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Panel de control</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general del sistema Dacan ERP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {kpiCards.map(({ label, valor, sub, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-gray-100 rounded-md">
                <Icon className="h-4 w-4 text-gray-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{valor}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Módulos */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Módulos del sistema</h2>
          <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
            {listos} / {modulos.length}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(listos / modulos.length) * 100}%` }}
          />
        </div>
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {modulos.map(({ label, done, href }) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className={[
                "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                done ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white",
              ].join(" ")}>
                {done && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {href && done ? (
                <Link href={href} className="text-gray-900 hover:text-blue-600 hover:underline">{label}</Link>
              ) : (
                <span className={done ? "text-gray-900" : "text-gray-400"}>{label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
