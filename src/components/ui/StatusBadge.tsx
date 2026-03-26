interface StatusBadgeProps {
  status: number;
}

const statusConfig: Record<number, { label: string; className: string }> = {
  0: { label: 'Draft', className: 'badge-draft' },
  1: { label: 'Active', className: 'badge-active' },
  2: { label: 'Paused', className: 'badge-paused' },
  3: { label: 'Completed', className: 'badge-completed' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[0];
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
