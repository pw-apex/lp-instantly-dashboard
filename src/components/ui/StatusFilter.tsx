'use client';

interface StatusFilterProps {
  value: string;
  onChange: (status: string) => void;
}

const filters = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'completed', label: 'Completed' },
];

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            value === f.key
              ? 'bg-primary/20 text-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
