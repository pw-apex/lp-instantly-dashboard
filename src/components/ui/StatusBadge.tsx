type StatusBadgeProps = {
  status: number;
};

const statusConfig: Record<number, { label: string; className: string }> = {
  0: { label: 'Draft', className: 'bg-[#dbeafe] text-[#1e40af]' },
  1: { label: 'Active', className: 'bg-[#dcfce7] text-[#166534]' },
  2: { label: 'Paused', className: 'bg-[#fef9c3] text-[#854d0e]' },
  3: { label: 'Completed', className: 'bg-[#f3f4f6] text-[#4b5563]' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[0];
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
