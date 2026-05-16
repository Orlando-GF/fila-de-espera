import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { updateSolicitation, updateStatus } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { JudicialBadge, PriorityBadge, StatusBadge } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { SolicitationForm } from "@/components/solicitation-form";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { getRegistryOptions, getSolicitation } from "@/lib/fila-espera";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ editar?: string; msg?: string; erro?: string; return_to?: string }>;
};

function safeReturnTo(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <div className="mt-1 text-xs font-semibold text-slate-950">{value || "-"}</div>
    </div>
  );
}

export default async function SolicitationDetailsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const [solicitation, options] = await Promise.all([getSolicitation(id), getRegistryOptions()]);

  if (!solicitation) notFound();

  const isEditing = query?.editar === "1";
  const message = query?.msg;
  const error = query?.erro;
  const returnTo = safeReturnTo(query?.return_to);
  const detailHref = `/solicitacoes/${solicitation.id}`;
  const currentDetailsHref = returnTo ? `${detailHref}?return_to=${encodeURIComponent(returnTo)}` : detailHref;
  const backHref = returnTo ?? (isEditing ? detailHref : "/lista-espera");
  const editHref = returnTo
    ? `/solicitacoes/${solicitation.id}?editar=1&return_to=${encodeURIComponent(returnTo)}`
    : `${detailHref}?editar=1`;
  const boundUpdate = updateSolicitation.bind(null, solicitation.id);

  return (
    <AppShell>
      <PageHeader
        title={isEditing ? "Editar solicitação" : "Detalhes da solicitação"}
        description={solicitation.nome_paciente}
        action={
          <div className="flex gap-2">
            <Link
              href={backHref}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Voltar
            </Link>
            {!isEditing ? (
              <Link
                href={editHref}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                <Edit size={15} aria-hidden="true" />
                Editar
              </Link>
            ) : null}
          </div>
        }
      />
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

      {isEditing ? (
        <SolicitationForm
          action={boundUpdate}
          cancelHref={returnTo ?? detailHref}
          initialData={solicitation}
          options={options}
          mode="edit"
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
          <section className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Paciente" value={solicitation.nome_paciente} />
            <DetailItem label="Prontuário" value={solicitation.prontuario} />
            <DetailItem label="Telefone" value={solicitation.telefone} />
            <DetailItem label="Responsável" value={solicitation.responsavel} />
            <DetailItem label="Especialidade" value={solicitation.especialidade} />
            <DetailItem label="Procedimento" value={solicitation.procedimento} />
            <DetailItem label="Profissional solicitante" value={solicitation.profissional_solicitante} />
            <DetailItem label="Data de entrada" value={formatDate(solicitation.data_entrada)} />
            <DetailItem label="Criado em" value={formatDateTime(solicitation.criado_em)} />
            <DetailItem label="Atualizado em" value={formatDateTime(solicitation.atualizado_em)} />
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Observação</p>
              <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-800">
                {solicitation.observacao || "-"}
              </p>
            </div>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Situação</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <StatusBadge status={solicitation.status} label={solicitation.status_nome} />
              <PriorityBadge prioridade={solicitation.prioridade} />
              {solicitation.judicial ? <JudicialBadge /> : null}
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Chamado em: {formatDateTime(solicitation.data_chamado)}
            </p>
            <form action={updateStatus} className="mt-4 grid gap-2">
              <input type="hidden" name="id" value={solicitation.id} />
              <input type="hidden" name="return_to" value={currentDetailsHref} />
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Alterar status
                <select
                  name="status"
                  defaultValue={solicitation.status}
                  className="select-control h-9 rounded-md border border-slate-300 bg-white px-2.5 pr-10 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {options.status.map((status) => (
                    <option key={status.codigo} value={status.codigo}>
                      {status.nome}
                    </option>
                  ))}
                </select>
              </label>
              <button className="h-9 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700">
                Atualizar status
              </button>
            </form>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
