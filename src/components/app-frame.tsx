"use client";

import Link from "next/link";
import { Activity, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useSyncExternalStore } from "react";
import { signOut } from "@/app/actions";
import { SidebarNav } from "@/components/sidebar-nav";

const storageKey = "fila-cer-sidebar-collapsed";
const storageEvent = "fila-cer-sidebar-storage";

function subscribeSidebar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(storageEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(storageEvent, callback);
  };
}

function getSidebarSnapshot() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(storageKey) === "1";
}

export function AppFrame({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const collapsed = useSyncExternalStore(subscribeSidebar, getSidebarSnapshot, () => false);

  function toggleSidebar() {
    const next = !collapsed;
    window.localStorage.setItem(storageKey, next ? "1" : "0");
    window.dispatchEvent(new Event(storageEvent));
  }

  return (
    <div className="app-uppercase min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-[var(--sidebar)] py-4 text-white shadow-xl transition-all duration-200 lg:flex ${
          collapsed ? "w-16 px-3" : "w-64 px-3"
        }`}
      >
        <div className="h-10">
          <Link
            href="/"
            className="grid h-10 w-full min-w-0 items-center rounded-lg transition-[column-gap,grid-template-columns,padding] duration-200"
            style={{
              columnGap: collapsed ? 0 : 8,
              gridTemplateColumns: collapsed ? "40px 0fr" : "40px minmax(0, 1fr)",
              paddingInline: collapsed ? 0 : 8,
            }}
            title="Fila CER II"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--primary)] text-white">
              <Activity size={20} aria-hidden="true" />
            </span>
            <span
              className={`min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
                collapsed ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden={collapsed}
            >
              <span className="block text-base font-bold leading-5">Fila CER II</span>
              <span className="block text-xs font-medium text-[var(--sidebar-muted)]">Controle operacional</span>
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className={`mt-4 grid w-full items-center border border-white/10 bg-white/5 text-xs font-semibold text-[#d7e5e4] transition-[background-color,border-color,color,column-gap,grid-template-columns,padding] duration-200 hover:bg-white/10 hover:text-white ${
            collapsed ? "h-10 rounded-lg" : "h-8 rounded-md"
          }`}
          style={{
            columnGap: collapsed ? 0 : 8,
            gridTemplateColumns: collapsed ? "1fr" : "minmax(0, 1fr) 16px",
            paddingInline: collapsed ? 0 : 12,
          }}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <ChevronRight className="mx-auto" size={16} aria-hidden="true" />
          ) : (
            <>
              <span className="min-w-0 overflow-hidden whitespace-nowrap text-left">Recolher menu</span>
              <ChevronLeft size={16} aria-hidden="true" />
            </>
          )}
        </button>

        <div className="mt-4">
          <SidebarNav collapsed={collapsed} />
        </div>

        {userEmail ? (
          <div className="mt-auto border-t border-white/10 pt-3">
            {!collapsed ? (
              <p className="mb-2 truncate px-2 text-xs font-semibold text-[var(--sidebar-muted)]">{userEmail}</p>
            ) : null}
            <form action={signOut}>
              <button
                className={`inline-flex w-full items-center text-xs font-semibold text-[#d7e5e4] transition hover:bg-white/10 hover:text-white ${
                  collapsed ? "h-10 justify-center rounded-lg px-0" : "h-9 gap-2 rounded-md px-2"
                }`}
                title={`Sair de ${userEmail}`}
              >
                <LogOut size={16} aria-hidden="true" />
                {!collapsed ? "Sair" : <span className="sr-only">Sair</span>}
              </button>
            </form>
          </div>
        ) : null}
      </aside>

      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur lg:hidden">
        <div className="flex flex-col gap-3 px-3 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--primary)] text-white">
              <Activity size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold leading-5">Fila CER II</span>
              <span className="block text-xs text-slate-500">Controle operacional</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 overflow-x-auto">
            <SidebarNav compact />
            {userEmail ? (
              <form action={signOut}>
                <button
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                  title={`Sair de ${userEmail}`}
                >
                  <LogOut size={15} aria-hidden="true" />
                  Sair
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </header>

      <main className={`w-full transition-[padding] duration-200 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="mx-auto w-full max-w-[1320px] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">{children}</div>
      </main>
    </div>
  );
}
