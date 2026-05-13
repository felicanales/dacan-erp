"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Package, Tag, Warehouse,
  Users, ShoppingCart, ClipboardList, Target, Map,
  BarChart3, CheckSquare, CalendarDays, FileText,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ElementType };
type SidebarProps = { onNavigate?: () => void };

const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "General", items: [
    { label: "Inicio",   href: "/dashboard", icon: LayoutDashboard },
    { label: "Páginas",  href: "/paginas",   icon: FileText },
  ]},
  { label: "Operaciones", items: [
    { label: "Proveedores",    href: "/proveedores", icon: Building2 },
    { label: "Containers",     href: "/containers",  icon: Package },
    { label: "Inventario",     href: "/inventario",  icon: Warehouse },
  ]},
  { label: "Comercial", items: [
    { label: "Catálogo",        href: "/productos",    icon: Tag },
    { label: "Clientes B2B",    href: "/clientes/b2b", icon: Users },
    { label: "Clientes B2C",    href: "/clientes/b2c", icon: Users },
    { label: "Pedidos",         href: "/pedidos",      icon: ShoppingCart },
    { label: "Lista de Precios",href: "/precios",      icon: ClipboardList },
  ]},
  { label: "Estrategia", items: [
    { label: "OKRs",    href: "/okrs",    icon: Target },
    { label: "Roadmap", href: "/roadmap", icon: Map },
    { label: "KPIs",    href: "/kpis",    icon: BarChart3 },
  ]},
  { label: "Equipo", items: [
    { label: "Tareas",    href: "/tareas",    icon: CheckSquare },
    { label: "Reuniones", href: "/reuniones", icon: CalendarDays },
  ]},
];

const recentItems: NavItem[] = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Proveedores", href: "/proveedores", icon: Building2 },
  { label: "Containers", href: "/containers", icon: Package },
  { label: "Reuniones", href: "/reuniones", icon: CalendarDays },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-[calc(100dvh-3.5rem)] w-full shrink-0 flex-col border-b border-notion-border bg-notion-bg2 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:min-h-0 md:w-60 md:border-r md:border-b-0">
      {/* Logo */}
      <div className="hidden border-b border-notion-border px-4 py-4 md:block">
        <p className="text-base font-semibold text-notion-text md:text-sm">Dacan Global Trading</p>
        <p className="mt-0.5 text-sm text-notion-muted md:text-xs">ERP interno</p>
      </div>

      <section className="border-b border-notion-border px-4 py-5 md:hidden">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-notion-muted">Recientes</p>
        </div>
        <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          {recentItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="flex h-32 min-w-36 flex-col justify-between rounded-lg border border-notion-border bg-notion-bg p-4 text-notion-text transition-colors hover:bg-notion-bg3"
            >
              <Icon className="h-6 w-6 text-notion-muted" />
              <span className="text-base font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5 md:space-y-4 md:px-2 md:py-3">
        {navGroups.map(({ label, items }) => (
          <div key={label}>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-notion-muted md:mb-1">
              {label}
            </p>
            <div className="space-y-1 md:space-y-0.5">
              {items.map(({ label: itemLabel, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-base transition-colors duration-100 md:min-h-0 md:gap-2 md:px-2 md:py-1.5 md:text-sm",
                      active
                        ? "bg-notion-bg3 text-notion-text font-medium"
                        : "text-notion-muted hover:bg-notion-bg3 hover:text-notion-text"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
                    <span className="truncate">{itemLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-notion-border px-5 py-4 md:px-4 md:py-3">
        <p className="text-[10px] text-notion-faint font-mono">v0.1 — desarrollo</p>
      </div>
    </aside>
  );
}
