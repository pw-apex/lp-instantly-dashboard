interface KpiCardProps {
  label: string;
  value: string | number;
  color: string;
  suffix?: string;
}

export default function KpiCard({ label, value, color, suffix }: KpiCardProps) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="mono text-2xl font-semibold" style={{ color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}
