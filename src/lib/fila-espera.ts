import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  Especialidade,
  FilaEspera,
  FilaFilters,
  Paciente,
  Procedimento,
  ProfissionalSolicitante,
  RegistryOptions,
  SelectOption,
  StatusFila,
} from "@/lib/types";

export type DashboardStats = {
  totalAguardando: number;
  byEspecialidade: { especialidade: string; total: number }[];
  byStatus: { status: string; total: number }[];
  nextByEspecialidade: FilaEspera[];
  configMissing: boolean;
};

const emptyStats: DashboardStats = {
  totalAguardando: 0,
  byEspecialidade: [],
  byStatus: [],
  nextByEspecialidade: [],
  configMissing: false,
};

export const WAITLIST_PAGE_SIZE = 25;

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function searchTerm(value: string) {
  return value.replace(/[,%]/g, " ").replace(/\s+/g, " ").trim();
}

async function withStatusLabels(rows: FilaEspera[]) {
  if (!rows.length) return rows;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("status_fila").select("codigo, nome");
  if (error) throw error;

  const labels = new Map((data ?? []).map((item) => [item.codigo, item.nome]));
  return rows.map((row) => ({
    ...row,
    status_nome: labels.get(row.status) ?? row.status_nome,
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    return { ...emptyStats, configMissing: true };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("fila_espera")
    .select("*")
    .order("data_entrada", { ascending: true })
    .order("criado_em", { ascending: true });

  if (error) throw error;

  const rows = await withStatusLabels((data ?? []) as FilaEspera[]);
  const aguardando = rows.filter((row) => row.status === "aguardando");

  const byEspecialidade = Object.entries(
    aguardando.reduce<Record<string, number>>((acc, row) => {
      acc[row.especialidade] = (acc[row.especialidade] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([especialidade, total]) => ({ especialidade, total }))
    .sort((a, b) => a.especialidade.localeCompare(b.especialidade));

  const byStatus = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([status, total]) => ({ status, total }));

  const seen = new Set<string>();
  const nextByEspecialidade = aguardando.filter((row) => {
    if (seen.has(row.especialidade)) return false;
    seen.add(row.especialidade);
    return true;
  });

  return {
    totalAguardando: aguardando.length,
    byEspecialidade,
    byStatus,
    nextByEspecialidade,
    configMissing: false,
  };
}

export async function getWaitlist(filters: FilaFilters = {}, page = 1) {
  if (!isSupabaseConfigured()) {
    return {
      rows: [] as FilaEspera[],
      configMissing: true,
      page: 1,
      pageSize: WAITLIST_PAGE_SIZE,
      total: 0,
      totalPages: 1,
    };
  }

  const supabase = await createSupabaseServerClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * WAITLIST_PAGE_SIZE;
  const to = from + WAITLIST_PAGE_SIZE - 1;
  let query = supabase
    .from("fila_espera")
    .select("*", { count: "exact" })
    .order("data_entrada", { ascending: true })
    .order("criado_em", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (clean(filters.busca)) {
    const term = searchTerm(clean(filters.busca) ?? "");
    query = query.or(`nome_paciente.ilike.%${term}%,prontuario.ilike.%${term}%`);
  }
  if (clean(filters.especialidade)) {
    query = query.eq("especialidade", clean(filters.especialidade));
  }
  if (clean(filters.procedimento)) {
    query = query.eq("procedimento", clean(filters.procedimento));
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (clean(filters.profissional_solicitante)) {
    query = query.eq("profissional_solicitante", clean(filters.profissional_solicitante));
  }
  if (filters.judicial === "sim") {
    query = query.eq("judicial", true);
  }
  if (filters.judicial === "nao") {
    query = query.eq("judicial", false);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  const total = count ?? 0;

  return {
    rows: await withStatusLabels((data ?? []) as FilaEspera[]),
    configMissing: false,
    page: safePage,
    pageSize: WAITLIST_PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / WAITLIST_PAGE_SIZE)),
  };
}

export async function getSolicitation(id: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("fila_espera")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return (await withStatusLabels([data as FilaEspera]))[0];
}

export async function getFilterOptions() {
  if (!isSupabaseConfigured()) {
    return {
      especialidades: [] as SelectOption[],
      procedimentos: [] as SelectOption[],
      profissionais: [] as SelectOption[],
      status: [] as StatusFila[],
    };
  }

  const registries = await getRegistryOptions();
  const toOptions = (values: string[]) =>
    values.sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
  return {
    especialidades: toOptions(registries.especialidades.map((row) => row.nome)),
    procedimentos: toOptions(registries.procedimentos.map((row) => row.nome)),
    profissionais: toOptions(registries.profissionais.map((row) => row.nome)),
    status: registries.status,
  };
}

export async function getRegistryOptions(): Promise<RegistryOptions> {
  if (!isSupabaseConfigured()) {
    return {
      pacientes: [],
      especialidades: [],
      procedimentos: [],
      profissionais: [],
      status: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  const [pacientes, especialidades, procedimentos, profissionais, status] = await Promise.all([
    supabase
      .from("pacientes")
      .select("id, nome, prontuario, telefone, responsavel")
      .order("nome", { ascending: true }),
    supabase
      .from("especialidades")
      .select("id, nome, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true }),
    supabase
      .from("procedimentos")
      .select("id, especialidade_id, nome, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true }),
    supabase
      .from("profissionais_solicitantes")
      .select("id, nome, cargo, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true }),
    supabase
      .from("status_fila")
      .select("id, codigo, nome, ativo")
      .eq("ativo", true)
      .order("criado_em", { ascending: true }),
  ]);

  const errors = [pacientes.error, especialidades.error, procedimentos.error, profissionais.error, status.error].filter(Boolean);
  if (errors[0]) throw errors[0];

  return {
    pacientes: (pacientes.data ?? []) as Paciente[],
    especialidades: (especialidades.data ?? []) as Especialidade[],
    procedimentos: (procedimentos.data ?? []) as Procedimento[],
    profissionais: (profissionais.data ?? []) as ProfissionalSolicitante[],
    status: (status.data ?? []) as StatusFila[],
  };
}
