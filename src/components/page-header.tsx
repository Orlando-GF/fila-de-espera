export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-normal text-[var(--foreground)]">
          {title}
        </h1>
        {description ? <p className="mt-1 max-w-3xl text-xs font-medium text-[var(--muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
