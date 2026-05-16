"use client";

import Link from "next/link";
import { ClipboardList, Database, LayoutDashboard, PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nova-solicitacao", label: "Nova solicitação", icon: PlusCircle },
  { href: "/lista-espera", label: "Lista de espera", icon: ClipboardList },
  { href: "/cadastros", label: "Cadastros", icon: Database },
];

export function SidebarNav({ compact = false, collapsed = false }: { compact?: boolean; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={compact ? "flex gap-1.5 overflow-x-auto" : "grid gap-2"}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            style={
              compact
                ? undefined
                : {
                    columnGap: collapsed ? 0 : 8,
                    gridTemplateColumns: collapsed ? "16px 0fr" : "16px minmax(0, 1fr)",
                    paddingInline: collapsed ? 12 : 8,
                  }
            }
            className={
              compact
                ? `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`
                : `grid w-full items-center text-xs font-semibold transition-[background-color,color,column-gap,grid-template-columns,padding] duration-200 ${
                    isActive
                      ? "bg-[#e7f8f1] text-[#0b3b34]"
                      : "text-[#d7e5e4] hover:bg-white/10 hover:text-white"
                  } ${collapsed ? "h-10 rounded-lg" : "h-9 rounded-md"}`
            }
          >
            <Icon size={16} aria-hidden="true" />
            {compact ? (
              item.label
            ) : (
              <span
                className={`min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
                  collapsed ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden={collapsed}
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
