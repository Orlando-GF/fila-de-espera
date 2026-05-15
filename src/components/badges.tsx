import { labelize } from "@/lib/formatters";
import type { Prioridade } from "@/lib/types";

const statusClass: Record<string, string> = {
  aguardando: "bg-sky-50 text-sky-800 ring-sky-200",
  chamado: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  agendado: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  atendido: "bg-slate-100 text-slate-700 ring-slate-200",
  faltou: "bg-orange-50 text-orange-800 ring-orange-200",
  cancelado: "bg-rose-50 text-rose-800 ring-rose-200",
  desistiu: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  duplicado: "bg-yellow-50 text-yellow-800 ring-yellow-200",
};

const priorityClass: Record<Prioridade, string> = {
  normal: "bg-slate-100 text-slate-700 ring-slate-200",
  prioridade: "bg-amber-50 text-amber-800 ring-amber-200",
  urgente: "bg-red-50 text-red-800 ring-red-200",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ${className}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <Badge label={label ?? labelize(status)} className={statusClass[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"} />;
}

export function PriorityBadge({ prioridade }: { prioridade: Prioridade }) {
  return <Badge label={labelize(prioridade)} className={priorityClass[prioridade]} />;
}

export function JudicialBadge() {
  return <Badge label="Judicial" className="bg-purple-50 text-purple-800 ring-purple-200" />;
}
