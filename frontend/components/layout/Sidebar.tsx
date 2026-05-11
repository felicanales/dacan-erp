"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Package,
  Tag,
  Warehouse,
  Users,
  ShoppingCart,
  ClipboardList,
  Target,
  Map,
  BarChart3,
  CheckSquare,
  CalendarDays,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ElementType };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "General",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Proveedores", href: "/proveedores", icon: Building2 },
      { label: "Containers", href: "/containers", icon: Package },
      { label: "Inventario", href: "/inventario", icon: Warehouse },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Catálogo", href: "/productos", icon: Tag },
      { label: "Clientes B2B", href: "/clientes/b2b", icon: Users },
      { label: "Clientes B2C", href: "/clientes/b2c", icon: Users },
      { label: "Pedidos", href: "/pedidos", icon: ShoppingCart },
      { label: "Lista de Precios", href: "/precios", icon: ClipboardList },
    ],
  },
  {
    label: "Estrategia",
    items: [
      { label: "OKRs", href: "/okrs", icon: Target },
      { label: "Roadmap", href: "/roadmap", icon: Map },
      { label: "KPIs", href: "/kpis", icon: BarChart3 },
    ],
  },
  {
    label: "Equipo",
    items: [
      { label: "Tareas", href: "/tareas", icon: CheckSquare },
      { label: "Reuniones", href: "/reuniones", icon: CalendarDays },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#111827] flex flex-col shrink-0 border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Dacan</p>
            <p className="text-white/40 text-[10px] mt-0.5 leading-none uppercase tracking-widest">
              Global Trading
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {navGroups.map(({ label, items }) => (
          <div key={label}>
            <p className="px-2.5 mb-1 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ label: itemLabel, href, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-white/10 text-white font-medium"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active
                          ? "text-white"
                          : "text-white/35 group-hover:text-white/60"
                      )}
                    />
                    <span className="truncate">{itemLabel}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5">
        <p className="text-[10px] text-white/20 font-mono">v0.1 — desarrollo</p>
      </div>
    </aside>
  );
}
