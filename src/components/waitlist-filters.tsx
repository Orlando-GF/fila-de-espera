"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { type FilaFilters, type SelectOption, type StatusFila } from "@/lib/types";

const selectClass =
  "select-control h-8 rounded-md border border-[var(--border)] bg-white px-2.5 pr-10 text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100";

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
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <form
      ref={formRef}
      className="mb-3 rounded-lg border border-[var(--border)] bg-white p-2 shadow-sm"
    >
      <input type="hidden" name="pagina" value="1" />
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            size={15}
            aria-hidden="true"
          />
          <input
            name="busca"
            defaultValue={filters.busca ?? ""}
            className="h-8 w-full rounded-md border border-[var(--border)] bg-white pl-9 pr-2.5 text-xs font-semibold text-[var(--foreground)] outline-none placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100"
            placeholder="Buscar paciente ou prontuário"
          />
        </label>

        <select className={`${selectClass} w-56`} name="especialidade" defaultValue={filters.especialidade ?? ""} onChange={submit}>
          <option value="">Todas especialidades</option>
          {options.especialidades.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select className={`${selectClass} w-40`} name="status" defaultValue={filters.status ?? ""} onChange={submit}>
          <option value="">Todos status</option>
          {options.status.map((status) => (
            <option key={status.codigo} value={status.codigo}>
              {status.nome}
            </option>
          ))}
        </select>

        <details className="relative">
          <summary className="inline-flex h-8 cursor-pointer list-none items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-bold text-[var(--foreground)] transition hover:bg-[#f4f7f8]">
            <SlidersHorizontal size={14} aria-hidden="true" />
            Mais filtros
          </summary>
          <div className="absolute right-0 top-10 z-20 grid w-[min(88vw,340px)] gap-2 rounded-lg border border-[var(--border)] bg-white p-2 shadow-xl">
            <select className={selectClass} name="procedimento" defaultValue={filters.procedimento ?? ""}>
              <option value="">Todos procedimentos</option>
              {options.procedimentos.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
            <button className="inline-flex h-8 items-center justify-center rounded-md bg-[var(--sidebar)] px-3 text-xs font-bold text-white transition hover:bg-[#173a3d]">
              Aplicar filtros
            </button>
          </div>
        </details>

        <div className="flex gap-2">
          <button
            className="inline-flex h-8 items-center justify-center rounded-md bg-[var(--sidebar)] px-2.5 text-xs font-bold text-white transition hover:bg-[#173a3d]"
            title="Buscar"
          >
            <Search size={14} aria-hidden="true" />
            <span className="sr-only">Buscar</span>
          </button>
          <Link
            href="/lista-espera"
            className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--border)] bg-white px-2.5 text-slate-700 transition hover:bg-slate-50"
            title="Limpar filtros"
          >
            <X size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </form>
  );
}
