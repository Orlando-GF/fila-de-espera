export function ConfigWarning() {
  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY` no arquivo `.env.local` para carregar e gravar dados
      pelo app.
    </div>
  );
}
