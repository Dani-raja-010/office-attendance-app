export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <span aria-hidden className="mt-2 flex gap-1">
          <span className="h-1 w-10 rounded-full bg-brand" />
          <span className="h-1 w-3 rounded-full bg-highlight" />
        </span>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
