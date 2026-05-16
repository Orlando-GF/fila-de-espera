import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfigWarning } from "@/components/config-warning";
import { NextPatientCard } from "@/components/next-patient-card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/badges";
import { getDashboardStats } from "@/lib/fila-espera";

type Props = {
  searchParams?: Promise<{ msg?: string; erro?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const message = params?.msg;
  const error = params?.erro;
  const stats = await getDashboardStats();

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Visão rápida da fila de espera, com foco em quem precisa ser chamado primeiro."
        action={
          <Link
            href="/nova-solicitacao"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            <PlusCircle size={15} aria-hidden="true" />
            Nova solicitação
          </Link>
        }
      />
      {stats.configMissing ? <ConfigWarning /> : null}
      {message ? (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-3">
        <StatCard label="Total aguardando" value={stats.totalAguardando} helper="Solicitações na fila ativa" />
        <section className="rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
          <p className="text-xs font-bold text-[var(--muted)]">Por especialidade</p>
          <div className="mt-3 grid gap-2">
            {stats.byEspecialidade.length ? (
              stats.byEspecialidade.map((item) => (
                <div key={item.especialidade} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-700">{item.especialidade}</span>
                  <span className="rounded bg-[#eef6f4] px-1.5 py-0.5 text-xs font-bold text-[var(--foreground)]">
                    {item.total}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs font-medium text-[var(--muted)]">Sem pacientes aguardando.</p>
            )}
          </div>
        </section>
        <section className="rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
          <p className="text-xs font-bold text-[var(--muted)]">Por status</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.byStatus.length ? (
              stats.byStatus.map((item) => (
                <span key={item.status} className="inline-flex items-center gap-1.5">
                  <StatusBadge status={item.status} />
                  <span className="text-xs font-bold text-slate-700">{item.total}</span>
                </span>
              ))
            ) : (
              <p className="text-xs font-medium text-[var(--muted)]">Sem registros.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Próximo paciente por especialidade</h2>
          <Link href="/lista-espera" className="text-xs font-bold text-[var(--primary)] hover:text-[var(--primary-strong)]">
            Ver lista completa
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stats.nextByEspecialidade.length ? (
            stats.nextByEspecialidade.map((patient) => <NextPatientCard key={patient.id} patient={patient} />)
          ) : (
            <div className="rounded-lg border border-[var(--border)] bg-white p-4 text-xs font-medium text-[var(--muted)] shadow-sm">
              Nenhum paciente aguardando no momento.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
