import Link from "next/link";
import { Activity, ClipboardList, Database, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import { signOut } from "@/app/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nova-solicitacao", label: "Nova solicitação", icon: PlusCircle },
  { href: "/lista-espera", label: "Lista de espera", icon: ClipboardList },
  { href: "/cadastros", label: "Cadastros", icon: Database },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white">
              <Activity size={21} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-6">Fila CER II</span>
              <span className="block text-sm text-slate-500">Controle operacional</span>
            </span>
          </Link>
          <nav className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <form action={signOut}>
                <button
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                  title={`Sair de ${user.email ?? "sessão"}`}
                >
                  <LogOut size={17} aria-hidden="true" />
                  Sair
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
