import { PhoneCall } from "lucide-react";
import { callNextPatient } from "@/app/actions";
import { formatDate } from "@/lib/formatters";
import type { FilaEspera } from "@/lib/types";
import { PriorityBadge } from "@/components/badges";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export function NextPatientCard({ patient }: { patient: FilaEspera }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{patient.especialidade}</p>
          <p className="mt-1 text-sm text-slate-500">{patient.procedimento}</p>
        </div>
        <PriorityBadge prioridade={patient.prioridade} />
      </div>
      <p className="mt-4 text-lg font-semibold text-slate-950">{patient.nome_paciente}</p>
      <p className="mt-1 text-sm text-slate-500">Entrada: {formatDate(patient.data_entrada)}</p>
      <form action={callNextPatient} className="mt-4">
        <input type="hidden" name="id" value={patient.id} />
        <input type="hidden" name="nome_paciente" value={patient.nome_paciente} />
        <ConfirmSubmitButton
          dialogTitle="Chamar paciente"
          message={`Deseja confirmar a chamada de ${patient.nome_paciente}? Esta ação altera o status da solicitação para chamado.`}
          confirmLabel="Chamar paciente"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <PhoneCall size={16} aria-hidden="true" />
          Chamar próximo
        </ConfirmSubmitButton>
      </form>
    </section>
  );
}
