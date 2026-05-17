import { daysSinceDate, formatWaitDays, labelize } from "@/lib/formatters";
import type { Prioridade } from "@/lib/types";

const statusClass: Record<string, string> = {
  aguardando: "bg-blue-50 text-blue-800 ring-blue-200",
  chamado: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  agendado: "bg-cyan-50 text-cyan-800 ring-cyan-200",
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
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ring-1 ${className}`}>
      {label.toLocaleUpperCase("pt-BR")}
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
  return <Badge label="Judicial" className="bg-blue-50 text-blue-800 ring-blue-200" />;
}

export function WaitDaysBadge({ date, compact = false }: { date: string; compact?: boolean }) {
  const days = daysSinceDate(date) ?? 0;
  const className =
    days >= 180
      ? "bg-rose-50 text-rose-800 ring-rose-200"
      : days >= 90
        ? "bg-orange-50 text-orange-800 ring-orange-200"
        : days >= 30
          ? "bg-amber-50 text-amber-800 ring-amber-200"
          : "bg-slate-100 text-slate-700 ring-slate-200";

  return <Badge label={formatWaitDays(date, compact)} className={className} />;
}
