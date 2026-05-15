import Link from "next/link";
import { Check, Edit, PhoneCall } from "lucide-react";
import { updateStatus } from "@/app/actions";
import { formatDate } from "@/lib/formatters";
import { type FilaEspera, type StatusFila } from "@/lib/types";
import { JudicialBadge, PriorityBadge, StatusBadge } from "@/components/badges";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export function WaitlistTable({ rows, statuses }: { rows: FilaEspera[]; statuses: StatusFila[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Nenhuma solicitação encontrada para os filtros atuais.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-normal text-slate-500">
          <tr>
            <th className="w-16 px-4 py-3">Ordem</th>
            <th className="px-4 py-3">Paciente</th>
            <th className="px-4 py-3">Atendimento</th>
            <th className="w-44 px-4 py-3">Situação</th>
            <th className="w-28 px-4 py-3">Entrada</th>
            <th className="w-56 px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={row.id} className="align-middle transition hover:bg-slate-50">
              <td className="px-4 py-4">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                  {index + 1}
                </span>
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/solicitacoes/${row.id}`}
                  className="font-semibold leading-5 text-slate-950 hover:text-emerald-700"
                >
                  {row.nome_paciente}
                </Link>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>Pront. {row.prontuario ?? "-"}</span>
                  <span>{row.telefone ?? "Sem telefone"}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <p className="font-medium text-slate-800">{row.especialidade}</p>
                <p className="mt-1 text-sm text-slate-500">{row.procedimento}</p>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <PriorityBadge prioridade={row.prioridade} />
                  <StatusBadge status={row.status} label={row.status_nome} />
                  {row.judicial ? <JudicialBadge /> : null}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                {formatDate(row.data_entrada)}
              </td>
              <td className="px-4 py-4">
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <form action={updateStatus} className="flex-1">
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="status" value="chamado" />
                      <input type="hidden" name="return_to" value="/lista-espera" />
                      <ConfirmSubmitButton
                        dialogTitle="Chamar paciente"
                        message={`Deseja confirmar a chamada de ${row.nome_paciente}? Esta ação altera o status da solicitação para chamado.`}
                        confirmLabel="Chamar paciente"
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
                        disabled={row.status !== "aguardando"}
                        title="Chamar paciente"
                      >
                        <PhoneCall size={15} aria-hidden="true" />
                        Chamar
                      </ConfirmSubmitButton>
                    </form>
                    <Link
                      href={`/solicitacoes/${row.id}?editar=1`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Edit size={15} aria-hidden="true" />
                      Editar
                    </Link>
                  </div>
                  <form action={updateStatus} className="grid grid-cols-[1fr_auto] gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="return_to" value="/lista-espera" />
                    <select
                      name="status"
                      defaultValue={row.status}
                      className="select-control h-9 rounded-lg border border-slate-300 bg-white px-3 pr-10 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      aria-label="Alterar status"
                    >
                      {statuses.map((status) => (
                        <option key={status.codigo} value={status.codigo}>
                          {status.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 text-slate-700 transition hover:bg-slate-50"
                      title="Salvar status"
                    >
                      <Check size={15} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
