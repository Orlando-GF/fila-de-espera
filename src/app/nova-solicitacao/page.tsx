import { AppShell } from "@/components/app-shell";
import { ConfigWarning } from "@/components/config-warning";
import { PageHeader } from "@/components/page-header";
import { SolicitationForm } from "@/components/solicitation-form";
import { createSolicitation } from "@/app/actions";
import { getRegistryOptions } from "@/lib/fila-espera";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function NewSolicitationPage() {
  const options = await getRegistryOptions();

  return (
    <AppShell>
      <PageHeader
        title="Nova solicitação"
        description="Cadastre uma guia ou solicitação como uma nova linha na fila de espera."
      />
      {!isSupabaseConfigured() ? <ConfigWarning /> : null}
      <SolicitationForm action={createSolicitation} options={options} />
    </AppShell>
  );
}
