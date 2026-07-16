export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-[var(--background)] p-4 dark:border-white/10">
      <p className="text-sm text-black/60 dark:text-white/60">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-black/45 dark:text-white/45">{hint}</p>}
    </div>
  );
}
