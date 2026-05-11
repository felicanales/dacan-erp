"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Package, Tag, Warehouse,
  Users, ShoppingCart, ClipboardList, Target, Map,
  BarChart3, CheckSquare, CalendarDays,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ElementType };

const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "General",     items: [{ label: "Inicio",         href: "/dashboard",    icon: LayoutDashboard }] },
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-notion-bg2 border-r border-notion-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-notion-border">
        <p className="text-sm font-semibold text-notion-text">Dacan Global Trading</p>
        <p className="text-xs text-notion-muted mt-0.5">ERP interno</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {navGroups.map(({ label, items }) => (
          <div key={label}>
            <p className="px-2 mb-1 text-[10px] font-semibold text-notion-muted uppercase tracking-wide">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ label: itemLabel, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-100",
                      active
                        ? "bg-notion-bg3 text-notion-text font-medium"
                        : "text-notion-muted hover:bg-notion-bg3 hover:text-notion-text"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{itemLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-notion-border">
        <p className="text-[10px] text-notion-faint font-mono">v0.1 — desarrollo</p>
      </div>
    </aside>
  );
}
