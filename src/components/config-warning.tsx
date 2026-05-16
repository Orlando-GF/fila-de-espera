export function ConfigWarning() {
  return (
    <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
      Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY` no arquivo `.env.local` para carregar e gravar dados
      pelo app.
    </div>
  );
}
