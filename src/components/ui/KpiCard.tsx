type KpiCardProps = {
  label: string;
  value: string | number;
};

export default function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-[#e4e4e7] hover:border-[#a1a1aa] transition-colors">
      <span className="block text-[10px] uppercase tracking-widest text-[#52525b] font-medium mb-2">
        {label}
      </span>
      <span className="mono text-2xl font-medium text-[#09090b]">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
