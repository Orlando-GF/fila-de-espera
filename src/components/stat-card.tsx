export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
      <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[var(--foreground)]">{value}</p>
      {helper ? <p className="mt-1 text-xs font-medium text-[var(--muted)]">{helper}</p> : null}
    </section>
  );
}
