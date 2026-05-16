"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { capitalizeWords as formatTitle, formatPhone, onlyDigits } from "@/lib/text";
import type { FilaStatus, Prioridade } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function capitalizeWords(value: string | null) {
  if (!value) return null;
  return formatTitle(value).trim();
}

function titleText(formData: FormData, key: string) {
  return capitalizeWords(text(formData, key));
}

function digitsText(formData: FormData, key: string) {
  const value = onlyDigits(String(formData.get(key) ?? ""));
  return value || null;
}

function phoneText(formData: FormData, key: string) {
  const value = formatPhone(String(formData.get(key) ?? ""));
  return value || null;
}

function assertNoDigits(value: string | null, field: string) {
  if (value && /\d/.test(value)) {
    throw new Error(`${field} não deve conter números.`);
  }
}

function requiredText(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Campo obrigatório: ${key}`);
  return value;
}

function requiredTitleText(formData: FormData, key: string) {
  const value = titleText(formData, key);
  if (!value) throw new Error(`Campo obrigatório: ${key}`);
  return value;
}

function refreshWaitlist() {
  revalidatePath("/");
  revalidatePath("/lista-espera");
}

function redirectWithMessage(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}msg=${encodeURIComponent(message)}`);
}

function redirectWithError(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}erro=${encodeURIComponent(message)}`);
}

function safePath(path: string | null, fallback = "/") {
  if (!path) return fallback;
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

function returnPath(formData: FormData, fallback = "/cadastros") {
  return safePath(text(formData, "return_to"), fallback);
}

function slugStatus(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function signIn(formData: FormData) {
  const email = requiredText(formData, "email");
  const password = requiredText(formData, "password");
  const next = safePath(text(formData, "next"), "/");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirectWithError(`/login?next=${encodeURIComponent(next)}`, "E-mail ou senha inválidos.");
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function resolvePatient(supabase: SupabaseServerClient, formData: FormData) {
  const pacienteId = text(formData, "paciente_id");
  const prontuario = digitsText(formData, "prontuario");

  if (pacienteId) {
    const { data, error } = await supabase
      .from("pacientes")
      .select("id, nome, prontuario, telefone, responsavel")
      .eq("id", pacienteId)
      .single();

    if (error) throw error;
    return {
      paciente_id: data.id as string,
      nome_paciente: data.nome as string,
      prontuario: data.prontuario as string | null,
      telefone: data.telefone as string | null,
      responsavel: data.responsavel as string | null,
    };
  }

  const nome = requiredTitleText(formData, "nome_paciente");
  const responsavel = titleText(formData, "responsavel");
  assertNoDigits(nome, "Nome do paciente");
  assertNoDigits(responsavel, "Responsável");

  if (prontuario) {
    const { data: existingPatient, error: existingPatientError } = await supabase
      .from("pacientes")
      .select("id, nome, prontuario, telefone, responsavel")
      .eq("prontuario", prontuario)
      .maybeSingle();

    if (existingPatientError) throw existingPatientError;

    if (existingPatient) {
      return {
        paciente_id: existingPatient.id as string,
        nome_paciente: existingPatient.nome as string,
        prontuario: existingPatient.prontuario as string | null,
        telefone: existingPatient.telefone as string | null,
        responsavel: existingPatient.responsavel as string | null,
      };
    }
  }

  const payload = {
    nome: capitalizeWords(nome),
    prontuario,
    telefone: phoneText(formData, "telefone"),
    responsavel,
  };

  const { data, error } = await supabase
    .from("pacientes")
    .insert(payload)
    .select("id, nome, prontuario, telefone, responsavel")
    .single();

  if (error) throw error;

  return {
    paciente_id: data.id as string,
    nome_paciente: data.nome as string,
    prontuario: data.prontuario as string | null,
    telefone: data.telefone as string | null,
    responsavel: data.responsavel as string | null,
  };
}

async function resolveRegistryLabels(supabase: SupabaseServerClient, formData: FormData) {
  const especialidadeId = requiredText(formData, "especialidade_id");
  const procedimentoId = requiredText(formData, "procedimento_id");
  const profissionalId = text(formData, "profissional_solicitante_id");

  const [especialidade, procedimento, profissional] = await Promise.all([
    supabase.from("especialidades").select("id, nome").eq("id", especialidadeId).single(),
    supabase.from("procedimentos").select("id, nome").eq("id", procedimentoId).single(),
    profissionalId
      ? supabase.from("profissionais_solicitantes").select("id, nome").eq("id", profissionalId).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (especialidade.error) throw especialidade.error;
  if (procedimento.error) throw procedimento.error;
  if (profissional.error) throw profissional.error;

  return {
    especialidade_id: especialidade.data.id as string,
    especialidade: especialidade.data.nome as string,
    procedimento_id: procedimento.data.id as string,
    procedimento: procedimento.data.nome as string,
    profissional_solicitante_id: profissional.data?.id as string | null,
    profissional_solicitante: profissional.data?.nome as string | null,
  };
}

export async function createSolicitation(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const patient = await resolvePatient(supabase, formData);
  const registries = await resolveRegistryLabels(supabase, formData);
  const payload = {
    data_entrada: requiredText(formData, "data_entrada"),
    ...patient,
    ...registries,
    prioridade: requiredText(formData, "prioridade") as Prioridade,
    judicial: formData.get("judicial") === "on",
    observacao: capitalizeWords(text(formData, "observacao")),
    status: "aguardando" as FilaStatus,
  };

  const { error } = await supabase.from("fila_espera").insert(payload);
  if (error) throw error;

  refreshWaitlist();
  redirectWithMessage("/lista-espera", "Solicitação criada com sucesso.");
}

export async function updateSolicitation(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const patient = await resolvePatient(supabase, formData);
  const registries = await resolveRegistryLabels(supabase, formData);
  const payload = {
    data_entrada: requiredText(formData, "data_entrada"),
    ...patient,
    ...registries,
    prioridade: requiredText(formData, "prioridade") as Prioridade,
    status: requiredText(formData, "status") as FilaStatus,
    judicial: formData.get("judicial") === "on",
    observacao: capitalizeWords(text(formData, "observacao")),
  };

  const { error } = await supabase.from("fila_espera").update(payload).eq("id", id);
  if (error) throw error;

  refreshWaitlist();
  revalidatePath(`/solicitacoes/${id}`);
  redirectWithMessage(`/solicitacoes/${id}`, "Solicitação atualizada com sucesso.");
}

export async function updateStatus(formData: FormData) {
  const id = requiredText(formData, "id");
  const status = requiredText(formData, "status") as FilaStatus;
  const returnTo = returnPath(formData, "/lista-espera");
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("fila_espera")
    .update({
      status,
      data_chamado: status === "chamado" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  // Prevent double call in concurrent usage.
  if (status === "chamado") {
    query = query.eq("status", "aguardando");
  }

  const { data, error } = await query.select("id").maybeSingle();
  if (error) throw error;

  if (status === "chamado" && !data) {
    redirectWithError(returnTo, "Esse paciente já não estava mais aguardando.");
  }

  refreshWaitlist();
  revalidatePath(`/solicitacoes/${id}`);
  redirectWithMessage(returnTo, "Status atualizado com sucesso.");
}

export async function callNextPatient(formData: FormData) {
  const id = requiredText(formData, "id");
  const nomePaciente = text(formData, "nome_paciente") ?? "Paciente";
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("fila_espera")
    .update({ status: "chamado", data_chamado: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "aguardando")
    .select("id")
    .maybeSingle();

  if (error) throw error;

  refreshWaitlist();
  revalidatePath(`/solicitacoes/${id}`);

  if (!data) {
    redirectWithMessage("/", "Esse paciente já não estava mais aguardando.");
  }

  redirectWithMessage("/", `${nomePaciente} foi chamado com sucesso.`);
}

export async function createEspecialidade(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnTo = returnPath(formData);
  const nome = requiredTitleText(formData, "nome");
  assertNoDigits(nome, "Especialidade");
  const { error } = await supabase
    .from("especialidades")
    .insert({ nome });
  if (error) throw error;
  revalidatePath("/cadastros");
  revalidatePath("/nova-solicitacao");
  redirectWithMessage(returnTo, "Especialidade adicionada com sucesso.");
}

export async function createProcedimento(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnTo = returnPath(formData);
  const { error } = await supabase.from("procedimentos").insert({
    nome: requiredTitleText(formData, "nome"),
  });
  if (error) throw error;
  revalidatePath("/cadastros");
  revalidatePath("/nova-solicitacao");
  redirectWithMessage(returnTo, "Procedimento adicionado com sucesso.");
}

export async function createProfissionalSolicitante(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnTo = returnPath(formData);
  const nome = requiredTitleText(formData, "nome");
  const cargo = titleText(formData, "cargo");
  assertNoDigits(nome, "Profissional solicitante");
  assertNoDigits(cargo, "Cargo/tipo");
  const { error } = await supabase.from("profissionais_solicitantes").insert({
    nome,
    cargo,
  });
  if (error) throw error;
  revalidatePath("/cadastros");
  revalidatePath("/nova-solicitacao");
  redirectWithMessage(returnTo, "Profissional solicitante adicionado com sucesso.");
}

function registryTable(kind: string) {
  if (kind === "especialidade") return "especialidades";
  if (kind === "procedimento") return "procedimentos";
  if (kind === "profissional") return "profissionais_solicitantes";
  if (kind === "status") return "status_fila";
  throw new Error("Cadastro inválido.");
}

export async function updateRegistryItem(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnTo = returnPath(formData);
  const kind = requiredText(formData, "kind");
  const id = requiredText(formData, "id");
  const table = registryTable(kind);
  const nome = requiredTitleText(formData, "nome");
  const cargo = titleText(formData, "cargo");

  if (kind !== "procedimento") assertNoDigits(nome, kind === "especialidade" ? "Especialidade" : "Profissional solicitante");
  if (kind === "profissional") assertNoDigits(cargo, "Cargo/tipo");

  const payload = kind === "profissional" ? { nome, cargo } : { nome };

  const { error } = await supabase.from(table).update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/cadastros");
  revalidatePath("/nova-solicitacao");
  revalidatePath("/lista-espera");
  redirectWithMessage(returnTo, "Cadastro atualizado com sucesso.");
}

export async function deleteRegistryItem(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnTo = returnPath(formData);
  const kind = requiredText(formData, "kind");
  const id = requiredText(formData, "id");
  const table = registryTable(kind);

  if (kind === "status") {
    const { data: status, error: statusError } = await supabase
      .from("status_fila")
      .select("codigo")
      .eq("id", id)
      .single();
    if (statusError) throw statusError;

    const { count, error } = await supabase
      .from("fila_espera")
      .select("id", { count: "exact", head: true })
      .eq("status", status.codigo);
    if (error) throw error;
    if ((count ?? 0) > 0) {
      redirectWithError(returnTo, "Não é possível excluir um status em uso na fila.");
    }
  }

  const referenceChecks: Record<string, { column: string; message: string }> = {
    especialidade: {
      column: "especialidade_id",
      message: "Não é possível excluir uma especialidade em uso na fila.",
    },
    procedimento: {
      column: "procedimento_id",
      message: "Não é possível excluir um procedimento em uso na fila.",
    },
    profissional: {
      column: "profissional_solicitante_id",
      message: "Não é possível excluir um profissional solicitante em uso na fila.",
    },
  };

  const check = referenceChecks[kind];
  if (check) {
    const { count, error } = await supabase
      .from("fila_espera")
      .select("id", { count: "exact", head: true })
      .eq(check.column, id);
    if (error) throw error;
    if ((count ?? 0) > 0) redirectWithError(returnTo, check.message);
  }

  const { error } = await supabase.from(table).update({ ativo: false }).eq("id", id);
  if (error) throw error;
  revalidatePath("/cadastros");
  revalidatePath("/nova-solicitacao");
  revalidatePath("/lista-espera");
  redirectWithMessage(returnTo, "Cadastro excluído com sucesso.");
}

export async function createStatusLabel(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnTo = returnPath(formData);
  const nome = requiredTitleText(formData, "nome");
  const codigo = slugStatus(nome);

  if (!codigo) throw new Error("Status inválido.");

  const { error } = await supabase.from("status_fila").insert({ codigo, nome });
  if (error) throw error;

  revalidatePath("/cadastros");
  revalidatePath("/nova-solicitacao");
  revalidatePath("/lista-espera");
  redirectWithMessage(returnTo, "Status adicionado com sucesso.");
}

export async function updateStatusLabel(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnTo = returnPath(formData);
  const id = requiredText(formData, "id");
  const nome = requiredTitleText(formData, "nome");

  const { error } = await supabase.from("status_fila").update({ nome }).eq("id", id);
  if (error) throw error;

  revalidatePath("/cadastros");
  revalidatePath("/nova-solicitacao");
  revalidatePath("/lista-espera");
  redirectWithMessage(returnTo, "Status atualizado com sucesso.");
}
