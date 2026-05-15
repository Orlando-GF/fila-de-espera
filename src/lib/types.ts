export const STATUSES = [
  "aguardando",
  "chamado",
  "agendado",
  "atendido",
  "faltou",
  "cancelado",
  "desistiu",
  "duplicado",
] as const;

export const PRIORITIES = ["normal", "prioridade", "urgente"] as const;

export type FilaStatus = string;
export type Prioridade = (typeof PRIORITIES)[number];

export type FilaEspera = {
  id: string;
  data_entrada: string;
  paciente_id: string | null;
  nome_paciente: string;
  prontuario: string | null;
  telefone: string | null;
  responsavel: string | null;
  especialidade_id: string | null;
  especialidade: string;
  procedimento_id: string | null;
  procedimento: string;
  profissional_solicitante_id: string | null;
  profissional_solicitante: string | null;
  prioridade: Prioridade;
  status: FilaStatus;
  status_nome?: string;
  judicial: boolean;
  data_chamado: string | null;
  observacao: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type FilaFilters = {
  especialidade?: string;
  procedimento?: string;
  status?: string;
  profissional_solicitante?: string;
  judicial?: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type Paciente = {
  id: string;
  nome: string;
  prontuario: string | null;
  telefone: string | null;
  responsavel: string | null;
};

export type Especialidade = {
  id: string;
  nome: string;
  ativo: boolean;
};

export type Procedimento = {
  id: string;
  especialidade_id: string | null;
  nome: string;
  ativo: boolean;
};

export type ProfissionalSolicitante = {
  id: string;
  nome: string;
  cargo: string | null;
  ativo: boolean;
};

export type StatusFila = {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
};

export type RegistryOptions = {
  pacientes: Paciente[];
  especialidades: Especialidade[];
  procedimentos: Procedimento[];
  profissionais: ProfissionalSolicitante[];
  status: StatusFila[];
};
