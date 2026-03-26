type KpiCardProps = {
  label: string;
  value: string | number;
};

export default function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div className="bg-surface p-4 rounded-lg border border-border-default hover:border-text-muted transition-colors">
      <span className="block text-[10px] uppercase tracking-widest text-text-body font-medium mb-2">
        {label}
      </span>
      <span className="mono text-2xl font-medium text-text-heading">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
