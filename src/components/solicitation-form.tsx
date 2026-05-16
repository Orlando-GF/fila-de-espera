"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus, Search, Save, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { capitalizeWords, formatPhone, onlyDigits, stripDigits } from "@/lib/text";
import {
  PRIORITIES,
  type FilaEspera,
  type Paciente,
  type RegistryOptions,
} from "@/lib/types";
import { labelize } from "@/lib/formatters";

const inputClass =
  "h-9 w-full rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100";
const selectClass =
  "select-control h-9 w-full rounded-md border border-[var(--border)] px-2.5 pr-10 text-xs font-semibold text-slate-950 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100";
const labelClass = "text-xs font-bold text-slate-700";

type AttendanceItem = {
  id: string;
};

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  mode,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
  mode?: "title" | "digits" | "phone" | "free";
}) {
  const inputMode = mode ?? (type === "text" ? "title" : "free");

  return (
    <label className="grid gap-1.5">
      <span className={labelClass}>{label}</span>
      <input
        className={inputClass}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        inputMode={inputMode === "digits" || inputMode === "phone" ? "numeric" : undefined}
        onBlur={(event) => {
          if (inputMode === "title") event.currentTarget.value = capitalizeWords(stripDigits(event.currentTarget.value)).trim();
          if (inputMode === "digits") event.currentTarget.value = onlyDigits(event.currentTarget.value);
          if (inputMode === "phone") event.currentTarget.value = formatPhone(event.currentTarget.value);
        }}
        onChange={(event) => {
          if (inputMode === "digits") event.currentTarget.value = onlyDigits(event.currentTarget.value);
          if (inputMode === "phone") event.currentTarget.value = formatPhone(event.currentTarget.value);
          if (inputMode === "title") event.currentTarget.value = capitalizeWords(stripDigits(event.currentTarget.value));
        }}
      />
    </label>
  );
}

function AttendanceFields({
  item,
  index,
  canRemove,
  options,
  onRemove,
}: {
  item: AttendanceItem;
  index: number;
  canRemove: boolean;
  options: RegistryOptions;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[#f8fbfb] p-3">
      <input type="hidden" name="atendimento_id" value={item.id} />
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Atendimento {String(index + 1).padStart(2, "0")}</h3>
        </div>
        {canRemove ? (
          <button
            type="button"
            className="inline-grid size-8 shrink-0 place-items-center rounded-md border border-rose-200 bg-white text-rose-700 transition hover:bg-rose-50"
            title="Remover atendimento"
            aria-label={`Remover atendimento ${index + 1}`}
            onClick={() => onRemove(item.id)}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(210px,1fr)_minmax(210px,1fr)_150px_150px]">
        <label className="grid gap-1.5">
          <span className={labelClass}>Especialidade</span>
          <select className={selectClass} name={`especialidade_id_${item.id}`} required defaultValue="">
            <option value="">Selecione</option>
            {options.especialidades.map((especialidade) => (
              <option key={especialidade.id} value={especialidade.id}>
                {especialidade.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Procedimento</span>
          <select className={selectClass} name={`procedimento_id_${item.id}`} required defaultValue="">
            <option value="">Selecione</option>
            {options.procedimentos.map((procedimento) => (
              <option key={procedimento.id} value={procedimento.id}>
                {procedimento.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Prioridade</span>
          <select className={selectClass} name={`prioridade_${item.id}`} defaultValue="normal">
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {labelize(priority)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-9 items-center gap-2 self-end rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-bold text-slate-700">
          <input
            type="checkbox"
            name={`judicial_${item.id}`}
            className="size-4 rounded border-slate-300 text-[var(--primary)] focus:ring-emerald-500"
          />
          Judicial
        </label>
        <label className="grid gap-1.5 md:col-span-2 lg:col-span-4">
          <span className={labelClass}>Observação</span>
          <textarea
            className="min-h-16 w-full rounded-md border border-[var(--border)] bg-white px-2.5 py-2 text-xs font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100"
            name={`observacao_${item.id}`}
          />
        </label>
      </div>
    </div>
  );
}

export function SolicitationForm({
  action,
  cancelHref,
  initialData,
  options,
  mode = "create",
  variant = "page",
}: {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref?: string;
  initialData?: FilaEspera;
  options: RegistryOptions;
  mode?: "create" | "edit";
  variant?: "page" | "panel";
}) {
  const today = new Date().toISOString().slice(0, 10);
  const initialProntuario = initialData?.prontuario ?? "";
  const [prontuario, setProntuario] = useState(initialProntuario);
  const [foundPatient, setFoundPatient] = useState<Paciente | null>(
    initialData?.paciente_id
      ? {
          id: initialData.paciente_id,
          nome: initialData.nome_paciente,
          prontuario: initialData.prontuario,
          telefone: initialData.telefone,
          responsavel: initialData.responsavel,
        }
      : null,
  );
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "not-found">(
    initialData?.paciente_id ? "found" : "idle",
  );
  const [attendanceItems, setAttendanceItems] = useState<AttendanceItem[]>([{ id: "1" }]);
  const [nextAttendanceId, setNextAttendanceId] = useState(2);

  function addAttendance() {
    const id = String(nextAttendanceId);
    setAttendanceItems((current) => [...current, { id }]);
    setNextAttendanceId((current) => current + 1);
  }

  function removeAttendance(id: string) {
    setAttendanceItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  }

  useEffect(() => {
    const value = prontuario.trim();
    if (!value) return;

    const timeout = window.setTimeout(async () => {
      setLookupState("loading");
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nome, prontuario, telefone, responsavel")
        .eq("prontuario", value)
        .maybeSingle();

      if (error || !data) {
        setFoundPatient(null);
        setLookupState("not-found");
        return;
      }

      setFoundPatient(data as Paciente);
      setLookupState("found");
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [prontuario]);

  const patientDefaults = foundPatient ?? {
    nome: initialData?.nome_paciente ?? "",
    prontuario: initialData?.prontuario ?? "",
    telefone: initialData?.telefone ?? "",
    responsavel: initialData?.responsavel ?? "",
  };
  const isPanel = variant === "panel";
  const resolvedCancelHref = cancelHref ?? (mode === "edit" && initialData?.id ? `/solicitacoes/${initialData.id}` : "/lista-espera");

  return (
    <form
      action={action}
      className={
        isPanel
          ? "grid gap-3"
          : "rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm"
      }
    >
      <input type="hidden" name="paciente_id" value={foundPatient?.id ?? ""} />
      <input type="hidden" name="return_to" value={resolvedCancelHref} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-[#e7f8f1] p-3 md:col-span-2">
          <label className="grid gap-1.5">
            <span className={labelClass}>Prontuário</span>
            <div className="relative">
              <input
                className={`${inputClass} pr-10`}
                name="prontuario"
                value={prontuario}
                onChange={(event) => {
                  const value = event.target.value;
                  const digits = onlyDigits(value);
                  setProntuario(digits);
                  if (!digits.trim()) {
                    setFoundPatient(null);
                    setLookupState("idle");
                  }
                }}
                placeholder="Digite o número do prontuário"
                autoFocus
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                {lookupState === "loading" ? (
                  <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                ) : lookupState === "found" ? (
                  <CheckCircle2 className="text-emerald-700" size={16} aria-hidden="true" />
                ) : (
                  <Search size={16} aria-hidden="true" />
                )}
              </span>
            </div>
          </label>
          <p className="mt-2 text-xs font-medium text-slate-700">
            {lookupState === "found"
              ? "Paciente encontrado. Confira os dados e siga com os dados da solicitação."
              : lookupState === "not-found"
                ? "Nenhum paciente encontrado com este prontuário. Preencha os dados principais abaixo."
                : "Digite o prontuário para buscar automaticamente antes de cadastrar."}
          </p>
        </div>
        <div
          key={foundPatient?.id ?? `novo-${prontuario}`}
          className="rounded-lg border border-[var(--border)] bg-[#f8fbfb] p-3 md:col-span-2"
        >
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-slate-900">Dados do paciente</p>
            <p className="text-xs font-medium text-[var(--muted)]">
              {foundPatient
                ? "Dados recuperados pelo prontuário."
                : "Preencha quando o prontuário ainda não existir no cadastro."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_minmax(150px,0.45fr)_minmax(220px,0.8fr)]">
            <Field
              label="Nome do paciente"
              name="nome_paciente"
              required={!foundPatient}
              defaultValue={patientDefaults.nome}
            />
            <Field label="Telefone" name="telefone" defaultValue={patientDefaults.telefone} mode="phone" />
            <Field label="Responsável" name="responsavel" defaultValue={patientDefaults.responsavel} />
          </div>
        </div>
        {mode === "create" ? (
          <>
            <section className="rounded-lg border border-[var(--border)] bg-white p-3 md:col-span-2">
              <div className="mb-2">
                <h2 className="text-xs font-bold text-slate-900">Dados da guia</h2>
                <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                  Data de entrada e origem valem para todos os atendimentos abaixo.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-[180px_minmax(280px,1fr)]">
                <Field
                  label="Data de entrada"
                  name="data_entrada"
                  type="date"
                  required
                  defaultValue={today}
                />
                <label className="grid gap-1.5">
                  <span className={labelClass}>Profissional solicitante</span>
                  <select className={selectClass} name="profissional_solicitante_id" defaultValue="">
                    <option value="">Não informado</option>
                    {options.profissionais.map((profissional) => (
                      <option key={profissional.id} value={profissional.id}>
                        {profissional.nome}
                        {profissional.cargo ? ` - ${profissional.cargo}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-white p-3 md:col-span-2">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-900">Atendimentos solicitados</h2>
                  <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                    Adicione uma linha para cada especialidade ou procedimento da guia.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  onClick={addAttendance}
                >
                  <Plus size={14} aria-hidden="true" />
                  Adicionar atendimento
                </button>
              </div>
              <div className="grid gap-2">
                {attendanceItems.map((item, index) => (
                  <AttendanceFields
                    key={item.id}
                    item={item}
                    index={index}
                    canRemove={attendanceItems.length > 1}
                    options={options}
                    onRemove={removeAttendance}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-lg border border-[var(--border)] bg-white p-3 md:col-span-2">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">Dados da solicitação</h2>
                <p className="mt-1 text-xs font-medium text-[var(--muted)]">Data, área, procedimento e prioridade da guia.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[180px_minmax(210px,1fr)_minmax(210px,1fr)_150px]">
              <Field
                label="Data de entrada"
                name="data_entrada"
                type="date"
                required
                defaultValue={initialData?.data_entrada ?? today}
              />
              <label className="grid gap-1.5">
                <span className={labelClass}>Especialidade</span>
                <select className={selectClass} name="especialidade_id" required defaultValue={initialData?.especialidade_id ?? ""}>
                  <option value="">Selecione</option>
                  {options.especialidades.map((especialidade) => (
                    <option key={especialidade.id} value={especialidade.id}>
                      {especialidade.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className={labelClass}>Procedimento</span>
                <select className={selectClass} name="procedimento_id" required defaultValue={initialData?.procedimento_id ?? ""}>
                  <option value="">Selecione</option>
                  {options.procedimentos.map((procedimento) => (
                    <option key={procedimento.id} value={procedimento.id}>
                      {procedimento.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className={labelClass}>Prioridade</span>
                <select className={selectClass} name="prioridade" defaultValue={initialData?.prioridade ?? "normal"}>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {labelize(priority)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 lg:col-span-2">
                <span className={labelClass}>Profissional solicitante</span>
                <select
                  className={selectClass}
                  name="profissional_solicitante_id"
                  defaultValue={initialData?.profissional_solicitante_id ?? ""}
                >
                  <option value="">Não informado</option>
                  {options.profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                      {profissional.cargo ? ` - ${profissional.cargo}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex h-9 items-center gap-2 self-end rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  name="judicial"
                  defaultChecked={initialData?.judicial ?? false}
                  className="size-4 rounded border-slate-300 text-[var(--primary)] focus:ring-emerald-500"
                />
                Judicial
              </label>
              <label className="grid gap-1.5">
                <span className={labelClass}>Status</span>
                <select className={selectClass} name="status" defaultValue={initialData?.status ?? "aguardando"}>
                  {options.status.map((status) => (
                    <option key={status.codigo} value={status.codigo}>
                      {status.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 md:col-span-2 lg:col-span-4">
                <span className={labelClass}>Observação</span>
                <textarea
                  className="min-h-20 w-full rounded-md border border-[var(--border)] bg-white px-2.5 py-2 text-xs font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100"
                  name="observacao"
                  defaultValue={initialData?.observacao ?? ""}
                />
              </label>
            </div>
          </section>
        )}
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href={resolvedCancelHref}
          className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-bold text-white transition hover:bg-[var(--primary-strong)]">
          <Save size={15} aria-hidden="true" />
          Salvar
        </button>
      </div>
    </form>
  );
}
