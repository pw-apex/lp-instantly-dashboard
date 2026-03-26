'use client';

type StatusFilterProps = {
  value: string;
  onChange: (status: string) => void;
};

const filters = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'completed', label: 'Completed' },
];

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-6">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`text-sm pb-3 -mb-[1px] transition-colors ${
            value === f.key
              ? 'font-medium text-[#09090b] border-b-2 border-[#09090b]'
              : 'text-[#52525b] hover:text-[#09090b]'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
