'use client';

import { useState } from 'react';
import type { DateRange } from '@/lib/types';
import { getPresetLabel } from '@/lib/dates';

interface DateRangeFilterProps {
  value: DateRange;
  customStart?: string;
  customEnd?: string;
  onChange: (preset: DateRange, customStart?: string, customEnd?: string) => void;
}

const presets: DateRange[] = ['last7', 'last14', 'mtd', 'custom'];

export default function DateRangeFilter({ value, customStart, customEnd, onChange }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(value === 'custom');
  const [start, setStart] = useState(customStart || '');
  const [end, setEnd] = useState(customEnd || '');

  return (
    <div className="flex items-center gap-2 flex-wrap">
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
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === preset
              ? 'bg-primary text-white'
              : 'bg-navy-700 text-slate-400 hover:text-white hover:bg-navy-600'
          }`}
        >
          {getPresetLabel(preset)}
        </button>
      ))}
      {showCustom && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (e.target.value && end) onChange('custom', e.target.value, end);
            }}
            className="bg-navy-700 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              if (start && e.target.value) onChange('custom', start, e.target.value);
            }}
            className="bg-navy-700 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
          />
        </div>
      )}
    </div>
  );
}
