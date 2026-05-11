import Link from "next/link";
import { Package, Building2, Users, ShoppingCart, ArrowRight } from "lucide-react";

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

const accesos = [
  { label: "Nuevo proveedor",          href: "/proveedores/nuevo", icon: Building2 },
  { label: "Nuevo container",          href: "/containers/nuevo",  icon: Package },
  { label: "Ver todos los containers", href: "/containers",        icon: Package },
];

const listos = modulos.filter((m) => m.done).length;

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-notion-text">Panel de control</h1>
        <p className="text-sm text-notion-muted mt-1">Resumen general del sistema Dacan ERP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, valor, sub, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group bg-notion-bg border border-notion-border rounded-lg p-5 hover:bg-notion-bg2 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-notion-bg2 rounded-md">
                <Icon className="h-4 w-4 text-notion-muted" />
              </div>
              <ArrowRight className="h-4 w-4 text-notion-faint opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-notion-text">{valor}</p>
            <p className="text-sm font-medium text-notion-text mt-1">{label}</p>
            <p className="text-xs text-notion-muted mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Módulos */}
        <div className="lg:col-span-2 bg-notion-bg border border-notion-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-notion-text">Módulos del sistema</h2>
            <span className="text-xs text-notion-muted bg-notion-bg2 rounded-full px-2.5 py-1">
              {listos} / {modulos.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-notion-bg2 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-brand rounded-full"
              style={{ width: `${(listos / modulos.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2.5">
            {modulos.map(({ label, done, href }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className={[
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                  done ? "bg-brand border-brand" : "border-notion-border2 bg-notion-bg",
                ].join(" ")}>
                  {done && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {href && done ? (
                  <Link href={href} className="text-notion-text hover:text-brand hover:underline">{label}</Link>
                ) : (
                  <span className={done ? "text-notion-text" : "text-notion-faint"}>{label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-notion-bg border border-notion-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-notion-text mb-4">Accesos rápidos</h2>
          <div className="space-y-1">
            {accesos.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-notion-muted hover:bg-notion-bg2 hover:text-notion-text transition-colors group"
              >
                <Icon className="h-4 w-4 text-notion-muted shrink-0" />
                {label}
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-notion-faint opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
