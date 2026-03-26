'use client';

import { useState } from 'react';

type SubValue = {
  label: string;
  value: string | number;
};

type KpiCardProps = {
  label: string;
  value: string | number;
  tooltip?: string;
  subValues?: SubValue[];
};

export default function KpiCard({ label, value, tooltip, subValues }: KpiCardProps) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div
      className="bg-surface p-4 rounded-lg border border-border-default hover:border-text-muted transition-colors relative"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-text-body font-medium mb-2">
        {label}
        {tooltip && (
          <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
          </svg>
        )}
      </span>
      <span className="mono text-2xl font-medium text-text-heading">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>

      {showPopover && tooltip && (
        <div className="absolute z-20 top-full left-0 mt-1 w-56 p-3 rounded-lg bg-surface-elevated border border-border-default shadow-sm text-[11px] text-text-body leading-relaxed">
          {tooltip}
        </div>
      )}

      {showPopover && subValues && subValues.length > 0 && (
        <div className="absolute z-20 top-full left-0 mt-1 w-48 p-3 rounded-lg bg-surface-elevated border border-border-default shadow-sm space-y-2">
          {subValues.map((sv) => (
            <div key={sv.label} className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest text-text-body font-medium">{sv.label}</span>
              <span className="mono text-sm font-medium text-text-heading">
                {typeof sv.value === 'number' ? sv.value.toLocaleString() : sv.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
