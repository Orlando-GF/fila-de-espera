"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { deleteRegistryItem, updateRegistryItem, updateStatusLabel } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { TitleInput } from "@/components/title-input";

const fieldBaseClass =
  "h-8 min-w-0 rounded-md border px-2.5 text-xs font-semibold text-[var(--foreground)] outline-none transition";

function fieldClass(editing: boolean) {
  return [
    fieldBaseClass,
    editing
      ? "border-[var(--border)] bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100"
      : "cursor-default border-transparent bg-transparent",
  ].join(" ");
}

const iconButtonClass =
  "inline-grid size-8 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-slate-50 hover:text-[var(--foreground)]";

function IconSaveButton() {
  return (
    <button
      type="submit"
      title="Salvar"
      aria-label="Salvar"
      className="inline-grid size-8 shrink-0 place-items-center rounded-md border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-50"
    >
      <Check size={14} aria-hidden="true" />
    </button>
  );
}

function IconCancelButton({ onCancel }: { onCancel: () => void }) {
  return (
    <button
      type="button"
      title="Cancelar edição"
      aria-label="Cancelar edição"
      onClick={onCancel}
      className={iconButtonClass}
    >
      <X size={14} aria-hidden="true" />
    </button>
  );
}

function IconEditButton({ onEdit }: { onEdit: () => void }) {
  return (
    <button
      type="button"
      title="Editar"
      aria-label="Editar"
      onClick={onEdit}
      className={iconButtonClass}
    >
      <Pencil size={14} aria-hidden="true" />
    </button>
  );
}

function focusFirstField(form: HTMLFormElement | null) {
  window.requestAnimationFrame(() => {
    form?.querySelector<HTMLInputElement>('input[name="nome"]')?.focus();
  });
}

function IconDeleteButton({
  kind,
  id,
  returnTo,
}: {
  kind: string;
  id: string;
  returnTo: string;
}) {
  return (
    <form action={deleteRegistryItem}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="return_to" value={returnTo} />
      <ConfirmSubmitButton
        dialogTitle="Excluir cadastro"
        message="Deseja realmente excluir este cadastro da lista? Se ele estiver em uso na fila, o sistema vai bloquear a exclusão."
        confirmLabel="Excluir"
        className="inline-grid size-8 shrink-0 place-items-center rounded-md border border-rose-200 bg-white text-rose-700 transition hover:bg-rose-50"
        title="Excluir"
        aria-label="Excluir"
      >
        <Trash2 size={14} aria-hidden="true" />
      </ConfirmSubmitButton>
    </form>
  );
}

export function RegistrySingleFieldRow({
  kind,
  id,
  value,
  returnTo,
  allowNumbers = false,
}: {
  kind: "especialidade" | "procedimento" | "status";
  id: string;
  value: string;
  returnTo: string;
  allowNumbers?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const action = kind === "status" ? updateStatusLabel : updateRegistryItem;

  function enableEditing() {
    setEditing(true);
    focusFirstField(formRef.current);
  }

  return (
    <div className="border-t border-[var(--border)] px-3 py-2 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        <form ref={formRef} action={action} className="flex min-w-0 flex-1 items-center gap-2">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="return_to" value={returnTo} />
          <TitleInput
            className={`${fieldClass(editing)} flex-1`}
            name="nome"
            defaultValue={value}
            required
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
            allowNumbers={allowNumbers}
          />
          {editing ? (
            <>
              <IconSaveButton />
              <IconCancelButton
                onCancel={() => {
                  formRef.current?.reset();
                  setEditing(false);
                }}
              />
            </>
          ) : (
            <IconEditButton onEdit={enableEditing} />
          )}
        </form>
        <IconDeleteButton kind={kind} id={id} returnTo={returnTo} />
      </div>
    </div>
  );
}

export function RegistryProfessionalRow({
  id,
  nome,
  cargo,
  returnTo,
}: {
  id: string;
  nome: string;
  cargo: string;
  returnTo: string;
}) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function enableEditing() {
    setEditing(true);
    focusFirstField(formRef.current);
  }

  return (
    <div className="border-t border-[var(--border)] px-3 py-2 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        <form ref={formRef} action={updateRegistryItem} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="kind" value="profissional" />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="return_to" value={returnTo} />
          <TitleInput
            className={`${fieldClass(editing)} min-w-56 flex-1`}
            name="nome"
            defaultValue={nome}
            required
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
          />
          <TitleInput
            className={`${fieldClass(editing)} min-w-44 flex-1`}
            name="cargo"
            defaultValue={cargo}
            placeholder="Cargo/tipo"
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
          />
          {editing ? (
            <>
              <IconSaveButton />
              <IconCancelButton
                onCancel={() => {
                  formRef.current?.reset();
                  setEditing(false);
                }}
              />
            </>
          ) : (
            <IconEditButton onEdit={enableEditing} />
          )}
        </form>
        <IconDeleteButton kind="profissional" id={id} returnTo={returnTo} />
      </div>
    </div>
  );
}
