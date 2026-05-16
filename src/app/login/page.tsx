import { Activity, Lock } from "lucide-react";
import { signIn } from "@/app/actions";

type Props = {
  searchParams?: Promise<{ erro?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params?.next ?? "/";

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fb] px-4 py-8 text-slate-900">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-semibold leading-5">Fila CER II</h1>
            <p className="text-xs font-medium text-slate-500">Acesso operacional</p>
          </div>
        </div>

        {params?.erro ? (
          <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
            {params.erro}
          </div>
        ) : null}

        <form action={signIn} className="grid gap-3">
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-slate-700">E-mail</span>
            <input
              className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-slate-700">Senha</span>
            <input
              className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700">
            <Lock size={15} aria-hidden="true" />
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
