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
    <nav className={compact ? "flex gap-1.5 overflow-x-auto" : "grid gap-1"}>
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
            className={
              compact
                ? `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`
                : `inline-flex h-9 items-center rounded-md text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#e7f8f1] text-[#0b3b34]"
                      : "text-[#d7e5e4] hover:bg-white/10 hover:text-white"
                  } ${collapsed ? "justify-center px-0" : "gap-2 px-2"}`
            }
          >
            <Icon size={16} aria-hidden="true" />
            {compact || !collapsed ? item.label : <span className="sr-only">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
