export function MapPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 bg-black/[0.02] p-6 text-center text-sm text-black/50 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/50">
      <p>{message}</p>
    </div>
  );
}
