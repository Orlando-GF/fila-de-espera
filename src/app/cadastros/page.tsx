import {
  createEspecialidade,
  createProcedimento,
  createProfissionalSolicitante,
  createStatusLabel,
  deleteRegistryItem,
  updateRegistryItem,
  updateStatusLabel,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PageHeader } from "@/components/page-header";
import { TitleInput } from "@/components/title-input";
import { getRegistryOptions } from "@/lib/fila-espera";

const inputClass =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function RegistryPanel({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {count}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">{children}</div>
    </section>
  );
}

function DeleteButton({ kind, id }: { kind: string; id: string }) {
  return (
    <form action={deleteRegistryItem}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmitButton
        dialogTitle="Excluir cadastro"
        message="Deseja realmente excluir este cadastro da lista? Se ele estiver em uso na fila, o sistema vai bloquear a exclusão."
        confirmLabel="Excluir"
        className="h-9 rounded-md border border-rose-200 bg-white px-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
        title="Excluir"
      >
        Excluir
      </ConfirmSubmitButton>
    </form>
  );
}

function SingleFieldRow({
  kind,
  id,
  value,
  allowNumbers = false,
  action = updateRegistryItem,
}: {
  kind: string;
  id: string;
  value: string;
  allowNumbers?: boolean;
  action?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
      <form action={action} className="contents">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <TitleInput className={inputClass} name="nome" defaultValue={value} required allowNumbers={allowNumbers} />
        <button className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          Salvar
        </button>
      </form>
      <DeleteButton kind={kind} id={id} />
    </div>
  );
}

type Props = {
  searchParams?: Promise<{ msg?: string; erro?: string }>;
};

export default async function RegistriesPage({ searchParams }: Props) {
  const options = await getRegistryOptions();
  const params = await searchParams;
  const message = params?.msg;
  const error = params?.erro;

  return (
    <AppShell>
      <PageHeader title="Cadastros" description="Manutenção rápida das listas usadas na fila." />
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

      <div className="grid max-w-7xl gap-4">
        <RegistryPanel
          title="Especialidades"
          description="Áreas de atendimento."
          count={options.especialidades.length}
        >
          <form action={createEspecialidade} className="grid grid-cols-[1fr_auto] gap-2">
            <TitleInput className={inputClass} name="nome" placeholder="Nova especialidade" required />
            <button className="h-9 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700">
              Adicionar
            </button>
          </form>
          <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            {options.especialidades.map((item) => (
              <SingleFieldRow key={item.id} kind="especialidade" id={item.id} value={item.nome} />
            ))}
          </div>
        </RegistryPanel>

        <RegistryPanel
          title="Procedimentos"
          description="Cadastro único, sem vínculo por especialidade."
          count={options.procedimentos.length}
        >
          <form action={createProcedimento} className="grid grid-cols-[1fr_auto] gap-2">
            <TitleInput className={inputClass} name="nome" placeholder="Novo procedimento" required allowNumbers />
            <button className="h-9 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700">
              Adicionar
            </button>
          </form>
          <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            {options.procedimentos.map((item) => (
              <SingleFieldRow key={item.id} kind="procedimento" id={item.id} value={item.nome} allowNumbers />
            ))}
          </div>
        </RegistryPanel>

        <RegistryPanel
          title="Profissionais Solicitantes"
          description="Profissional, equipe ou origem solicitante."
          count={options.profissionais.length}
        >
          <form action={createProfissionalSolicitante} className="grid grid-cols-[1fr_0.85fr_auto] gap-2">
            <TitleInput className={inputClass} name="nome" placeholder="Nome ou equipe" required />
            <TitleInput className={inputClass} name="cargo" placeholder="Cargo/tipo" />
            <button className="h-9 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700">
              Adicionar
            </button>
          </form>
          <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            {options.profissionais.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_0.85fr_auto_auto] gap-2">
                <form action={updateRegistryItem} className="contents">
                  <input type="hidden" name="kind" value="profissional" />
                  <input type="hidden" name="id" value={item.id} />
                  <TitleInput className={inputClass} name="nome" defaultValue={item.nome} required />
                  <TitleInput className={inputClass} name="cargo" defaultValue={item.cargo ?? ""} />
                  <button className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Salvar
                  </button>
                </form>
                <DeleteButton kind="profissional" id={item.id} />
              </div>
            ))}
          </div>
        </RegistryPanel>

        <RegistryPanel
          title="Status Da Fila"
          description="Texto exibido; o código interno fica fixo."
          count={options.status.length}
        >
          <form action={createStatusLabel} className="grid grid-cols-[1fr_auto] gap-2">
            <TitleInput className={inputClass} name="nome" placeholder="Novo status" required />
            <button className="h-9 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700">
              Adicionar
            </button>
          </form>
          <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            {options.status.map((item) => (
              <SingleFieldRow key={item.id} kind="status" id={item.id} value={item.nome} action={updateStatusLabel} />
            ))}
          </div>
        </RegistryPanel>
      </div>
    </AppShell>
  );
}
