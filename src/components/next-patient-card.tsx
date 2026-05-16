import { PhoneCall } from "lucide-react";
import { callNextPatient } from "@/app/actions";
import { formatDate } from "@/lib/formatters";
import type { FilaEspera } from "@/lib/types";
import { PriorityBadge } from "@/components/badges";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export function NextPatientCard({ patient }: { patient: FilaEspera }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">{patient.especialidade}</p>
          <p className="mt-0.5 text-xs font-medium text-[var(--muted)]">{patient.procedimento}</p>
        </div>
        <PriorityBadge prioridade={patient.prioridade} />
      </div>
      <p className="mt-3 text-base font-bold text-[var(--foreground)]">{patient.nome_paciente}</p>
      <p className="mt-0.5 text-xs font-medium text-[var(--muted)]">Entrada: {formatDate(patient.data_entrada)}</p>
      <form action={callNextPatient} className="mt-3">
        <input type="hidden" name="id" value={patient.id} />
        <input type="hidden" name="nome_paciente" value={patient.nome_paciente} />
        <ConfirmSubmitButton
          dialogTitle="Chamar paciente"
          message={`Deseja confirmar a chamada de ${patient.nome_paciente}? Esta ação altera o status da solicitação para chamado.`}
          confirmLabel="Chamar paciente"
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-bold text-white transition hover:bg-[var(--primary-strong)]"
        >
          <PhoneCall size={14} aria-hidden="true" />
          Chamar próximo
        </ConfirmSubmitButton>
      </form>
    </section>
  );
}
