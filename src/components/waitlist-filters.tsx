import { Search, X } from "lucide-react";
import Link from "next/link";
import { type FilaFilters, type SelectOption, type StatusFila } from "@/lib/types";

const selectClass =
  "select-control h-10 rounded-lg border border-slate-300 bg-white px-3 pr-12 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export function WaitlistFilters({
  filters,
  options,
}: {
  filters: FilaFilters;
  options: {
    especialidades: SelectOption[];
    procedimentos: SelectOption[];
    profissionais: SelectOption[];
    status: StatusFila[];
  };
}) {
  return (
    <form className="mb-4 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.9fr_1fr_0.8fr_auto]">
      <select className={selectClass} name="especialidade" defaultValue={filters.especialidade ?? ""}>
        <option value="">Todas especialidades</option>
        {options.especialidades.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select className={selectClass} name="procedimento" defaultValue={filters.procedimento ?? ""}>
        <option value="">Todos procedimentos</option>
        {options.procedimentos.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select className={selectClass} name="status" defaultValue={filters.status ?? ""}>
        <option value="">Todos status</option>
        {options.status.map((status) => (
          <option key={status.codigo} value={status.codigo}>
            {status.nome}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        name="profissional_solicitante"
        defaultValue={filters.profissional_solicitante ?? ""}
      >
        <option value="">Todos solicitantes</option>
        {options.profissionais.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select className={selectClass} name="judicial" defaultValue={filters.judicial ?? ""}>
        <option value="">Todas demandas</option>
        <option value="sim">Judicial</option>
        <option value="nao">Não judicial</option>
      </select>
      <div className="flex gap-2">
        <button className="inline-flex h-10 min-w-28 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Search size={16} aria-hidden="true" />
          Filtrar
        </button>
        <Link
          href="/lista-espera"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-slate-700 transition hover:bg-slate-50"
          title="Limpar filtros"
        >
          <X size={16} aria-hidden="true" />
        </Link>
      </div>
    </form>
  );
}
