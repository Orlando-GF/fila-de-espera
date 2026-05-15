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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <PlusCircle size={18} aria-hidden="true" />
            Nova solicitação
          </Link>
        }
      />
      {stats.configMissing ? <ConfigWarning /> : null}
      {message ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Total aguardando" value={stats.totalAguardando} helper="Solicitações na fila ativa" />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Por especialidade</p>
          <div className="mt-4 grid gap-3">
            {stats.byEspecialidade.length ? (
              stats.byEspecialidade.map((item) => (
                <div key={item.especialidade} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">{item.especialidade}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-900">
                    {item.total}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Sem pacientes aguardando.</p>
            )}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Por status</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.byStatus.length ? (
              stats.byStatus.map((item) => (
                <span key={item.status} className="inline-flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-sm font-semibold text-slate-700">{item.total}</span>
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">Sem registros.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Próximo paciente por especialidade</h2>
          <Link href="/lista-espera" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            Ver lista completa
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.nextByEspecialidade.length ? (
            stats.nextByEspecialidade.map((patient) => <NextPatientCard key={patient.id} patient={patient} />)
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Nenhum paciente aguardando no momento.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
