import Link from "next/link";
import { Edit, MoreHorizontal, PhoneCall } from "lucide-react";
import { updateStatus } from "@/app/actions";
import { formatDate } from "@/lib/formatters";
import { type FilaEspera, type StatusFila } from "@/lib/types";
import { JudicialBadge, PriorityBadge, StatusBadge } from "@/components/badges";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

function StatusMenu({ row, statuses }: { row: FilaEspera; statuses: StatusFila[] }) {
  const availableStatuses = statuses.filter(
    (status) => status.codigo !== row.status && status.codigo !== "chamado",
  );

  if (!availableStatuses.length) return null;

  return (
    <details className="relative">
      <summary className="inline-flex h-8 cursor-pointer list-none items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
        <MoreHorizontal size={14} aria-hidden="true" />
        Status
      </summary>
      <div className="absolute right-0 top-10 z-20 grid w-52 gap-1 rounded-lg border border-[var(--border)] bg-white p-1.5 shadow-xl">
        {availableStatuses.map((status) => (
          <form key={status.codigo} action={updateStatus}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="status" value={status.codigo} />
            <input type="hidden" name="return_to" value="/lista-espera" />
            <button className="flex h-8 w-full items-center rounded-md px-2 text-left text-xs font-bold text-slate-700 transition hover:bg-[#eef6f4]">
              {status.nome}
            </button>
          </form>
        ))}
      </div>
    </details>
  );
}

export function WaitlistTable({
  rows,
  statuses,
  startIndex = 0,
}: {
  rows: FilaEspera[];
  statuses: StatusFila[];
  startIndex?: number;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-white p-6 text-center text-xs font-medium text-[var(--muted)] shadow-sm">
        Nenhuma solicitação encontrada para os filtros atuais.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {rows.map((row, index) => (
        <article
          key={row.id}
          className="grid gap-2 rounded-lg border border-[var(--border)] bg-white p-2.5 shadow-sm transition hover:border-[#bdd2d3] hover:bg-[#fbfdfd] lg:grid-cols-[44px_minmax(220px,1.4fr)_minmax(200px,1fr)_minmax(170px,0.8fr)_auto]"
        >
          <div className="flex items-start gap-2 lg:block">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-[#eef6f4] text-xs font-bold text-[var(--foreground)]">
              {String(startIndex + index + 1).padStart(2, "0")}
            </span>
            <div className="lg:hidden">
              <Link
                href={`/solicitacoes/${row.id}`}
                className="text-sm font-bold leading-5 text-[var(--foreground)] hover:text-[var(--primary)]"
              >
                {row.nome_paciente}
              </Link>
              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Pront. {row.prontuario ?? "-"} · {row.telefone ?? "Sem telefone"}
              </p>
            </div>
          </div>

          <div className="hidden min-w-0 lg:block">
            <Link
              href={`/solicitacoes/${row.id}`}
              className="text-sm font-bold leading-5 text-[var(--foreground)] hover:text-[var(--primary)]"
            >
              {row.nome_paciente}
            </Link>
            <p className="mt-1 text-xs font-medium text-[var(--muted)]">
              Pront. {row.prontuario ?? "-"} · {row.telefone ?? "Sem telefone"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800">{row.especialidade}</p>
            <p className="mt-0.5 text-xs font-medium text-[var(--muted)]">{row.procedimento}</p>
          </div>

          <div>
            <div className="flex flex-wrap gap-1.5">
              <PriorityBadge prioridade={row.prioridade} />
              <StatusBadge status={row.status} label={row.status_nome} />
              {row.judicial ? <JudicialBadge /> : null}
            </div>
            <p className="mt-1.5 text-xs font-bold text-[var(--muted)]">
              Entrada: {formatDate(row.data_entrada)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
            <form action={updateStatus}>
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="status" value="chamado" />
              <input type="hidden" name="return_to" value="/lista-espera" />
              <ConfirmSubmitButton
                dialogTitle="Chamar paciente"
                message={`Deseja confirmar a chamada de ${row.nome_paciente}? Esta ação altera o status da solicitação para chamado.`}
                confirmLabel="Chamar paciente"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-2.5 text-xs font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:bg-slate-300"
                disabled={row.status !== "aguardando"}
                title="Chamar paciente"
              >
                <PhoneCall size={14} aria-hidden="true" />
                Chamar
              </ConfirmSubmitButton>
            </form>
            <Link
              href={`/solicitacoes/${row.id}?editar=1`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Edit size={14} aria-hidden="true" />
              Editar
            </Link>
            <StatusMenu row={row} statuses={statuses} />
          </div>
        </article>
      ))}
    </div>
  );
}
