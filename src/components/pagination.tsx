import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Params = Record<string, string | string[] | undefined>;

function buildHref(params: Params, page: number) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === "msg" || key === "erro" || key === "nova") return;
    const first = Array.isArray(value) ? value[0] : value;
    if (first && key !== "pagina") search.set(key, first);
  });

  if (page > 1) search.set("pagina", String(page));
  const query = search.toString();
  return query ? `/lista-espera?${query}` : "/lista-espera";
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  params,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  params: Params;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--muted)] shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p>
        {start}-{end} de {total} registros
      </p>
      <div className="flex items-center gap-2">
        {canPrevious ? (
          <Link
            href={buildHref(params, page - 1)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 text-[var(--foreground)] transition hover:bg-[#f4f7f8]"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Anterior
          </Link>
        ) : (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-slate-400">
            <ChevronLeft size={14} aria-hidden="true" />
            Anterior
          </span>
        )}
        <span className="inline-flex h-8 items-center rounded-md bg-[#eef6f4] px-2.5 text-[var(--foreground)]">
          Página {page} de {totalPages}
        </span>
        {canNext ? (
          <Link
            href={buildHref(params, page + 1)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 text-[var(--foreground)] transition hover:bg-[#f4f7f8]"
          >
            Próxima
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-slate-400">
            Próxima
            <ChevronRight size={14} aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}
