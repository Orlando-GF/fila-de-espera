"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { DropdownPanel } from "@/components/dropdown-panel";
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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function applyFilters() {
    if (!formRef.current) return;

    const params = new URLSearchParams();
    const formData = new FormData(formRef.current);

    for (const [key, value] of formData.entries()) {
      if (key === "pagina") continue;
      const normalized = String(value).trim();
      if (normalized) params.set(key, normalized);
    }

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `/lista-espera?${queryString}` : "/lista-espera", { scroll: false });
    });
  }

  return (
    <form
      ref={formRef}
      aria-busy={isPending}
      className="mb-3 rounded-lg border border-[var(--border)] bg-white p-2 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
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

        <select className={`${selectClass} w-56`} name="especialidade" defaultValue={filters.especialidade ?? ""} onChange={applyFilters}>
          <option value="">Todas especialidades</option>
          {options.especialidades.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select className={`${selectClass} w-40`} name="status" defaultValue={filters.status ?? ""} onChange={applyFilters}>
          <option value="">Todos status</option>
          {options.status.map((status) => (
            <option key={status.codigo} value={status.codigo}>
              {status.nome}
            </option>
          ))}
        </select>

        <DropdownPanel
          ariaLabel="Mais filtros"
          title="Mais filtros"
          className="inline-grid size-8 place-items-center rounded-md border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:bg-[#f4f7f8]"
          panelClassName="absolute right-0 top-10 z-20 grid w-[min(88vw,340px)] gap-2 rounded-lg border border-[var(--border)] bg-white p-2 shadow-xl"
          trigger={<SlidersHorizontal size={14} aria-hidden="true" />}
        >
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
        </DropdownPanel>

        <div className="flex gap-2">
          <button
            className="inline-grid size-8 place-items-center rounded-md bg-[var(--sidebar)] text-white transition hover:bg-[#173a3d]"
            aria-label="Buscar"
            title="Buscar"
          >
            <Search size={14} aria-hidden="true" />
          </button>
          <Link
            href="/lista-espera"
            className="inline-grid size-8 place-items-center rounded-md border border-[var(--border)] bg-white text-slate-700 transition hover:bg-slate-50"
            aria-label="Limpar filtros"
            title="Limpar filtros"
          >
            <X size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </form>
  );
}
