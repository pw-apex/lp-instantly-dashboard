'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { DateRange } from '@/lib/types';
import { getPresetLabel } from '@/lib/dates';

type DateRangeFilterProps = {
  value: DateRange;
  customStart?: string;
  customEnd?: string;
  onChange: (preset: DateRange, customStart?: string, customEnd?: string) => void;
};

const presets: DateRange[] = ['last7', 'last30', 'mtd', 'custom'];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseDate(s: string): { year: number; month: number; day: number } | null {
  const parts = s.split('-');
  if (parts.length !== 3) return null;
  return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1, day: parseInt(parts[2], 10) };
}

function formatDisplayDate(s: string): string {
  const d = parseDate(s);
  if (!d) return s;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.month]} ${d.day}`;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type CalendarProps = {
  rangeStart: string | null;
  rangeEnd: string | null;
  hoverDate: string | null;
  onSelectDate: (dateStr: string) => void;
  onHover: (dateStr: string | null) => void;
};

function CalendarMonth({
  year,
  month,
  rangeStart,
  rangeEnd,
  hoverDate,
  onSelectDate,
  onHover,
}: CalendarProps & { year: number; month: number }) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const totalDays = daysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const effectiveEnd = rangeEnd || hoverDate;

  function isInRange(dateStr: string): boolean {
    if (!rangeStart || !effectiveEnd) return false;
    const lo = rangeStart < effectiveEnd ? rangeStart : effectiveEnd;
    const hi = rangeStart < effectiveEnd ? effectiveEnd : rangeStart;
    return dateStr >= lo && dateStr <= hi;
  }

  function isStart(dateStr: string): boolean {
    if (!rangeStart || !effectiveEnd) return dateStr === rangeStart;
    const lo = rangeStart < effectiveEnd ? rangeStart : effectiveEnd;
    return dateStr === lo;
  }

  function isEnd(dateStr: string): boolean {
    if (!rangeStart || !effectiveEnd) return false;
    const hi = rangeStart < effectiveEnd ? effectiveEnd : rangeStart;
    return dateStr === hi;
  }

  return (
    <div className="w-[224px]">
      <div className="text-xs font-medium text-text-heading text-center mb-2">
        {months[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {WEEKDAYS.map((d) => (
          <div key={d} className="h-7 flex items-center justify-center text-[10px] text-text-muted font-medium">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7" />
        ))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(year, month, day);
          const inRange = isInRange(dateStr);
          const start = isStart(dateStr);
          const end = isEnd(dateStr);
          const isToday = dateStr === today;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              onMouseEnter={() => onHover(dateStr)}
              className={`h-7 w-full text-[11px] font-medium transition-colors relative
                ${start || end
                  ? 'bg-text-heading text-bg rounded-md z-10'
                  : inRange
                    ? 'bg-surface-elevated text-text-heading'
                    : 'text-text-body hover:bg-hover hover:text-text-heading rounded-md'
                }
                ${isToday && !start && !end ? 'font-bold underline' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangeFilter({ value, customStart, customEnd, onChange }: DateRangeFilterProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(customStart || null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(customEnd || null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectionPhase, setSelectionPhase] = useState<'start' | 'end'>('start');
  const calendarRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Second month for side-by-side display
  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const goBack = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goForward = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showCalendar]);

  function handleSelectDate(dateStr: string) {
    if (selectionPhase === 'start') {
      setRangeStart(dateStr);
      setRangeEnd(null);
      setSelectionPhase('end');
    } else {
      const start = rangeStart!;
      const finalStart = start < dateStr ? start : dateStr;
      const finalEnd = start < dateStr ? dateStr : start;
      setRangeStart(finalStart);
      setRangeEnd(finalEnd);
      setSelectionPhase('start');
      setShowCalendar(false);
      onChange('custom', finalStart, finalEnd);
    }
  }

  function handlePresetClick(preset: DateRange) {
    if (preset === 'custom') {
      setShowCalendar(true);
      setSelectionPhase('start');
      if (!rangeStart) {
        setRangeStart(null);
        setRangeEnd(null);
      }
    } else {
      setShowCalendar(false);
      onChange(preset);
    }
  }

  const displayLabel = value === 'custom' && customStart && customEnd
    ? `${formatDisplayDate(customStart)} – ${formatDisplayDate(customEnd)}`
    : null;

  return (
    <div className="relative flex items-center gap-2 flex-wrap" ref={calendarRef}>
      <div className="hidden md:flex items-center gap-0.5 bg-surface-elevated p-1 rounded-lg">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
              value === preset
                ? 'bg-surface text-text-heading shadow-sm'
                : 'text-text-faint hover:text-text-heading'
            }`}
          >
            {preset === 'custom' && displayLabel ? displayLabel : getPresetLabel(preset)}
          </button>
        ))}
      </div>

      {showCalendar && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-surface border border-border-default rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={goBack}
              className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-heading transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-text-muted">
              {selectionPhase === 'start' ? 'Select start date' : 'Select end date'}
            </span>
            <button
              onClick={goForward}
              className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-heading transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex gap-4">
            <CalendarMonth
              year={viewYear}
              month={viewMonth}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoverDate={selectionPhase === 'end' ? hoverDate : null}
              onSelectDate={handleSelectDate}
              onHover={setHoverDate}
            />
            <div className="hidden lg:block border-l border-border-default" />
            <div className="hidden lg:block">
              <CalendarMonth
                year={secondYear}
                month={secondMonth}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                hoverDate={selectionPhase === 'end' ? hoverDate : null}
                onSelectDate={handleSelectDate}
                onHover={setHoverDate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
