export function Movement({ value }: { value: number | null }) {
  if (value === null) return <span className="rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">NEW</span>;
  if (value === 0) return <span className="text-xs text-[var(--text-dim)]">—</span>;
  return value > 0
    ? <span className="text-xs font-semibold text-emerald-400">▲{value}</span>
    : <span className="text-xs font-semibold text-red-400">▼{-value}</span>;
}
