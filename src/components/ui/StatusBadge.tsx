type StatusBadgeProps = {
  status: number;
};

const statusConfig: Record<number, { label: string; bgVar: string; textVar: string }> = {
  0: { label: 'Draft', bgVar: 'var(--badge-draft-bg)', textVar: 'var(--badge-draft-text)' },
  1: { label: 'Active', bgVar: 'var(--badge-active-bg)', textVar: 'var(--badge-active-text)' },
  2: { label: 'Paused', bgVar: 'var(--badge-paused-bg)', textVar: 'var(--badge-paused-text)' },
  3: { label: 'Completed', bgVar: 'var(--badge-completed-bg)', textVar: 'var(--badge-completed-text)' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[0];
  return (
    <span
      className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: config.bgVar, color: config.textVar }}
    >
      {config.label}
    </span>
  );
}
