import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfigWarning } from "@/components/config-warning";
import { Pagination } from "@/components/pagination";
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

function pageNumber(value: string | string[] | undefined) {
  const parsed = Number(first(value) ?? "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function WaitlistPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const requestedPage = pageNumber(params.pagina);
  const filters: FilaFilters = {
    busca: first(params.busca) ?? "",
    especialidade: first(params.especialidade) ?? "",
    procedimento: first(params.procedimento) ?? "",
    status: first(params.status) ?? "",
    profissional_solicitante: first(params.profissional_solicitante) ?? "",
    judicial: first(params.judicial) ?? "",
  };
  const message = first(params.msg);
  const error = first(params.erro);

  const [{ rows, configMissing, page, pageSize, total, totalPages }, options] = await Promise.all([
    getWaitlist(filters, requestedPage),
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
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            <PlusCircle size={15} aria-hidden="true" />
            Nova solicitação
          </Link>
        }
      />
      {configMissing ? <ConfigWarning /> : null}
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
      <WaitlistFilters filters={filters} options={options} />
      <WaitlistTable rows={rows} statuses={options.status} startIndex={(page - 1) * pageSize} />
      <Pagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} params={params} />
    </AppShell>
  );
}
