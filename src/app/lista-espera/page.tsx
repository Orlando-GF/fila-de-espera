import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfigWarning } from "@/components/config-warning";
import { PageHeader } from "@/components/page-header";
import { WaitlistFilters } from "@/components/waitlist-filters";
import { WaitlistTable } from "@/components/waitlist-table";
import { getFilterOptions, getWaitlist } from "@/lib/fila-espera";
import type { FilaFilters } from "@/lib/types";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WaitlistPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const filters: FilaFilters = {
    especialidade: first(params.especialidade) ?? "",
    procedimento: first(params.procedimento) ?? "",
    status: first(params.status) ?? "",
    profissional_solicitante: first(params.profissional_solicitante) ?? "",
    judicial: first(params.judicial) ?? "",
  };
  const message = first(params.msg);
  const error = first(params.erro);

  const [{ rows, configMissing }, options] = await Promise.all([
    getWaitlist(filters),
    getFilterOptions(),
  ]);

  return (
    <AppShell>
      <PageHeader
        title="Lista de espera"
        description="Fila operacional ordenada pelos pacientes mais antigos primeiro."
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
      {configMissing ? <ConfigWarning /> : null}
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
      <WaitlistFilters filters={filters} options={options} />
      <WaitlistTable rows={rows} statuses={options.status} />
    </AppShell>
  );
}
