import Link from "next/link";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import {
  createEspecialidade,
  createProcedimento,
  createProfissionalSolicitante,
  createStatusLabel,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { RegistryProfessionalRow, RegistrySingleFieldRow } from "@/components/registry-editable-row";
import { TitleInput } from "@/components/title-input";
import { getRegistryOptions } from "@/lib/fila-espera";

const inputClass =
  "h-8 min-w-0 rounded-md border border-[var(--border)] bg-white px-2.5 text-xs font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100";

const registrySections = [
  {
    key: "especialidades",
    label: "Especialidades",
    description: "Áreas de atendimento disponíveis para selecionar na solicitação.",
  },
  {
    key: "procedimentos",
    label: "Procedimentos",
    description: "Lista única de procedimentos, sem vínculo fixo com especialidade.",
  },
  {
    key: "profissionais",
    label: "Profissionais solicitantes",
    description: "Profissionais, equipes ou origens que encaminham solicitações.",
  },
  {
    key: "status",
    label: "Status da fila",
    description: "Textos exibidos na fila; o código interno fica preservado.",
  },
] as const;

type RegistrySection = (typeof registrySections)[number]["key"];

function activeRegistrySection(value?: string): RegistrySection {
  return registrySections.some((section) => section.key === value)
    ? (value as RegistrySection)
    : "especialidades";
}

function sectionPath(section: RegistrySection) {
  return `/cadastros?tipo=${section}`;
}

function AddButton() {
  return (
    <button className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--primary-strong)]">
      <Plus size={14} aria-hidden="true" />
      Adicionar
    </button>
  );
}

function RegistryShell({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-[var(--border)] bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-3 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
          <p className="mt-1 max-w-2xl text-xs font-medium text-[var(--muted)]">{description}</p>
        </div>
        <span className="rounded-md bg-[var(--surface-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
          {count} itens
        </span>
      </div>
      {children}
    </section>
  );
}

function RegistryNav({
  active,
  counts,
}: {
  active: RegistrySection;
  counts: Record<RegistrySection, number>;
}) {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-white p-1.5 shadow-sm">
      <nav className="flex flex-wrap gap-1" aria-label="Tipos de cadastro">
        {registrySections.map((section) => {
          const selected = section.key === active;
          return (
            <Link
              key={section.key}
              href={sectionPath(section.key)}
              className={[
                "flex h-8 items-center justify-between gap-2 rounded-md px-2.5 text-xs font-semibold transition",
                selected
                  ? "bg-[var(--surface-soft)] text-[var(--primary-strong)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              <span>{section.label}</span>
              <span
                className={[
                  "rounded px-1.5 py-0.5 text-[11px]",
                  selected ? "bg-white text-[var(--primary-strong)]" : "bg-[var(--surface-soft)] text-[var(--muted)]",
                ].join(" ")}
              >
                {counts[section.key]}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="m-3 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-6 text-center text-xs font-semibold text-[var(--muted)]">
      Nenhum cadastro ativo nesta lista.
    </div>
  );
}

type Props = {
  searchParams?: Promise<{ msg?: string; erro?: string; tipo?: string }>;
};

export default async function RegistriesPage({ searchParams }: Props) {
  const options = await getRegistryOptions();
  const params = await searchParams;
  const message = params?.msg;
  const error = params?.erro;
  const activeSection = activeRegistrySection(params?.tipo);
  const returnTo = sectionPath(activeSection);
  const counts: Record<RegistrySection, number> = {
    especialidades: options.especialidades.length,
    procedimentos: options.procedimentos.length,
    profissionais: options.profissionais.length,
    status: options.status.length,
  };
  const activeConfig = registrySections.find((section) => section.key === activeSection)!;

  return (
    <AppShell>
      <div className="mb-4 border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold tracking-normal text-[var(--foreground)]">Cadastros</h1>
        <p className="mt-1 text-xs font-medium text-[var(--muted)]">
          Manutenção rápida das listas usadas na fila.
        </p>
      </div>

      {message ? (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid max-w-5xl gap-3">
        <RegistryNav active={activeSection} counts={counts} />

        <RegistryShell
          title={activeConfig.label}
          description={activeConfig.description}
          count={counts[activeSection]}
        >
          {activeSection === "especialidades" ? (
            <>
              <form action={createEspecialidade} className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-3">
                <input type="hidden" name="return_to" value={returnTo} />
                <TitleInput className={`${inputClass} flex-1`} name="nome" placeholder="Nova especialidade" required />
                <AddButton />
              </form>
              <div>
                {options.especialidades.length ? (
                  options.especialidades.map((item) => (
                    <RegistrySingleFieldRow
                      key={item.id}
                      kind="especialidade"
                      id={item.id}
                      value={item.nome}
                      returnTo={returnTo}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
            </>
          ) : null}

          {activeSection === "procedimentos" ? (
            <>
              <form action={createProcedimento} className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-3">
                <input type="hidden" name="return_to" value={returnTo} />
                <TitleInput className={`${inputClass} flex-1`} name="nome" placeholder="Novo procedimento" required allowNumbers />
                <AddButton />
              </form>
              <div>
                {options.procedimentos.length ? (
                  options.procedimentos.map((item) => (
                    <RegistrySingleFieldRow
                      key={item.id}
                      kind="procedimento"
                      id={item.id}
                      value={item.nome}
                      returnTo={returnTo}
                      allowNumbers
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
            </>
          ) : null}

          {activeSection === "profissionais" ? (
            <>
              <form action={createProfissionalSolicitante} className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-3">
                <input type="hidden" name="return_to" value={returnTo} />
                <TitleInput className={`${inputClass} min-w-56 flex-1`} name="nome" placeholder="Nome ou equipe" required />
                <TitleInput className={`${inputClass} min-w-44 flex-1`} name="cargo" placeholder="Cargo ou tipo" />
                <AddButton />
              </form>
              <div>
                {options.profissionais.length ? (
                  options.profissionais.map((item) => (
                    <RegistryProfessionalRow
                      key={item.id}
                      id={item.id}
                      nome={item.nome}
                      cargo={item.cargo ?? ""}
                      returnTo={returnTo}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
            </>
          ) : null}

          {activeSection === "status" ? (
            <>
              <form action={createStatusLabel} className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-3">
                <input type="hidden" name="return_to" value={returnTo} />
                <TitleInput className={`${inputClass} flex-1`} name="nome" placeholder="Novo status" required />
                <AddButton />
              </form>
              <div>
                {options.status.length ? (
                  options.status.map((item) => (
                    <RegistrySingleFieldRow
                      key={item.id}
                      kind="status"
                      id={item.id}
                      value={item.nome}
                      returnTo={returnTo}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
            </>
          ) : null}
        </RegistryShell>
      </div>
    </AppShell>
  );
}
