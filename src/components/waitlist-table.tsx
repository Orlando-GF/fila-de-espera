import Link from "next/link";
import { Edit, Eye, MoreHorizontal, PhoneCall } from "lucide-react";
import { updateStatus } from "@/app/actions";
import { formatDate } from "@/lib/formatters";
import { type FilaEspera, type StatusFila } from "@/lib/types";
import { JudicialBadge, PriorityBadge, StatusBadge } from "@/components/badges";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { DropdownPanel } from "@/components/dropdown-panel";

const actionIconClass =
  "inline-grid size-8 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-white text-slate-700 transition hover:bg-slate-50";

function StatusMenu({ row, statuses, returnTo }: { row: FilaEspera; statuses: StatusFila[]; returnTo: string }) {
  const availableStatuses = statuses.filter(
    (status) => status.codigo !== row.status && status.codigo !== "chamado",
  );

  if (!availableStatuses.length) return null;

  return (
    <DropdownPanel
      ariaLabel="Alterar status"
      title="Alterar status"
      className={actionIconClass}
      panelClassName="absolute right-0 top-10 z-20 grid w-52 gap-1 rounded-lg border border-[var(--border)] bg-white p-1.5 shadow-xl"
      trigger={
        <MoreHorizontal size={14} aria-hidden="true" />
      }
    >
      {availableStatuses.map((status) => (
        <form key={status.codigo} action={updateStatus}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="status" value={status.codigo} />
          <input type="hidden" name="return_to" value={returnTo} />
          <button className="flex h-8 w-full items-center rounded-md px-2 text-left text-xs font-bold text-slate-700 transition hover:bg-[#eef6f4]">
            {status.nome}
          </button>
        </form>
      ))}
    </DropdownPanel>
  );
}

export function WaitlistTable({
  rows,
  statuses,
  returnTo = "/lista-espera",
  startIndex = 0,
}: {
  rows: FilaEspera[];
  statuses: StatusFila[];
  returnTo?: string;
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
      {rows.map((row, index) => {
        const detailHref = `/solicitacoes/${row.id}?return_to=${encodeURIComponent(returnTo)}`;
        const editHref = `/solicitacoes/${row.id}?editar=1&return_to=${encodeURIComponent(returnTo)}`;

        return (
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
                  href={detailHref}
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
                href={detailHref}
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
                <input type="hidden" name="return_to" value={returnTo} />
                <ConfirmSubmitButton
                  dialogTitle="Chamar paciente"
                  message={`Deseja confirmar a chamada de ${row.nome_paciente}? Esta ação altera o status da solicitação para chamado.`}
                  confirmLabel="Chamar paciente"
                  className="inline-grid size-8 shrink-0 place-items-center rounded-md bg-[var(--primary)] text-white transition hover:bg-[var(--primary-strong)] disabled:bg-slate-300"
                  disabled={row.status !== "aguardando"}
                  aria-label="Chamar paciente"
                  title="Chamar paciente"
                >
                  <PhoneCall size={14} aria-hidden="true" />
                </ConfirmSubmitButton>
              </form>
              <Link
                href={detailHref}
                className={actionIconClass}
                aria-label="Ver detalhes"
                title="Ver detalhes"
              >
                <Eye size={14} aria-hidden="true" />
              </Link>
              <Link
                href={editHref}
                className={actionIconClass}
                aria-label="Editar solicitação"
                title="Editar solicitação"
              >
                <Edit size={14} aria-hidden="true" />
              </Link>
              <StatusMenu row={row} statuses={statuses} returnTo={returnTo} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
