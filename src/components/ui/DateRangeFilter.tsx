'use client';

import { useState } from 'react';
import type { DateRange } from '@/lib/types';
import { getPresetLabel } from '@/lib/dates';

type DateRangeFilterProps = {
  value: DateRange;
  customStart?: string;
  customEnd?: string;
  onChange: (preset: DateRange, customStart?: string, customEnd?: string) => void;
};

const presets: DateRange[] = ['last7', 'last14', 'mtd', 'custom'];

export default function DateRangeFilter({ value, customStart, customEnd, onChange }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(value === 'custom');
  const [start, setStart] = useState(customStart || '');
  const [end, setEnd] = useState(customEnd || '');

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="hidden md:flex items-center gap-0.5 bg-[#f4f4f5] p-1 rounded-lg">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              if (preset === 'custom') {
                setShowCustom(true);
                if (start && end) onChange('custom', start, end);
              } else {
                setShowCustom(false);
                onChange(preset);
              }
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
              value === preset
                ? 'bg-white text-[#09090b] shadow-sm'
                : 'text-[#71717a] hover:text-[#09090b]'
            }`}
          >
            {getPresetLabel(preset)}
          </button>
        ))}
      </div>
      {showCustom && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (e.target.value && end) onChange('custom', e.target.value, end);
            }}
            className="bg-white border border-[#e4e4e7] rounded-md px-2 py-1 text-xs text-[#09090b] mono"
          />
          <span className="text-[#a1a1aa] text-xs">to</span>
          <input
            type="date"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              if (start && e.target.value) onChange('custom', start, e.target.value);
            }}
            className="bg-white border border-[#e4e4e7] rounded-md px-2 py-1 text-xs text-[#09090b] mono"
          />
        </div>
      )}
    </div>
  );
}
