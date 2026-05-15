"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Search, Save } from "lucide-react";
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
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const selectClass =
  "select-control h-11 w-full rounded-lg border border-slate-300 px-3 pr-16 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelClass = "text-sm font-medium text-slate-700";

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
    <label className="grid gap-2">
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
          if (inputMode === "title") event.currentTarget.value = stripDigits(event.currentTarget.value);
        }}
      />
    </label>
  );
}

export function SolicitationForm({
  action,
  initialData,
  options,
  mode = "create",
}: {
  action: (formData: FormData) => void | Promise<void>;
  initialData?: FilaEspera;
  options: RegistryOptions;
  mode?: "create" | "edit";
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
  const [especialidadeId, setEspecialidadeId] = useState(initialData?.especialidade_id ?? "");

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

  return (
    <form action={action} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <input type="hidden" name="paciente_id" value={foundPatient?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 md:col-span-2">
          <label className="grid gap-2">
            <span className={labelClass}>Prontuário</span>
            <div className="relative">
              <input
                className={`${inputClass} pr-11`}
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {lookupState === "loading" ? (
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                ) : lookupState === "found" ? (
                  <CheckCircle2 className="text-emerald-700" size={18} aria-hidden="true" />
                ) : (
                  <Search size={18} aria-hidden="true" />
                )}
              </span>
            </div>
          </label>
          <p className="mt-2 text-sm text-slate-700">
            {lookupState === "found"
              ? "Paciente encontrado. Confira os dados e siga com os dados da solicitação."
              : lookupState === "not-found"
                ? "Nenhum paciente encontrado com este prontuário. Preencha os dados principais abaixo."
                : "Digite o prontuário para buscar automaticamente antes de cadastrar."}
          </p>
        </div>
        <div
          key={foundPatient?.id ?? `novo-${prontuario}`}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2"
        >
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-900">Dados do paciente</p>
            <p className="text-xs text-slate-500">
              {foundPatient
                ? "Dados recuperados pelo prontuário."
                : "Preencha quando o prontuário ainda não existir no cadastro."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
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
        <section className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Dados da solicitação</h2>
              <p className="mt-1 text-xs text-slate-500">Data, área, procedimento e prioridade da guia.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Data de entrada"
              name="data_entrada"
              type="date"
              required
              defaultValue={initialData?.data_entrada ?? today}
            />
            <label className="grid gap-2">
              <span className={labelClass}>Especialidade</span>
              <select
                className={selectClass}
                name="especialidade_id"
                required
                value={especialidadeId}
                onChange={(event) => setEspecialidadeId(event.target.value)}
              >
                <option value="">Selecione</option>
                {options.especialidades.map((especialidade) => (
                  <option key={especialidade.id} value={especialidade.id}>
                    {especialidade.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
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
            <label className="grid gap-2">
              <span className={labelClass}>Prioridade</span>
              <select className={selectClass} name="prioridade" defaultValue={initialData?.prioridade ?? "normal"}>
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {labelize(priority)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 xl:col-span-2">
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
            <label className="flex h-11 items-center gap-3 self-end rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="judicial"
                defaultChecked={initialData?.judicial ?? false}
                className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Demanda judicial
            </label>
          {mode === "edit" ? (
          <label className="grid gap-2">
              <span className={labelClass}>Status</span>
            <select className={selectClass} name="status" defaultValue={initialData?.status ?? "aguardando"}>
              {options.status.map((status) => (
                <option key={status.codigo} value={status.codigo}>
                  {status.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}
            <label className="grid gap-2 md:col-span-2 xl:col-span-4">
              <span className={labelClass}>Observação</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                name="observacao"
                defaultValue={initialData?.observacao ?? ""}
              />
            </label>
          </div>
        </section>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/cadastros"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cadastros
        </Link>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
          <Save size={17} aria-hidden="true" />
          Salvar
        </button>
      </div>
    </form>
  );
}
