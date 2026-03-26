import type { DateRange, DateRangeValue } from './types';

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function getDateRange(preset: DateRange, customStart?: string, customEnd?: string): DateRangeValue {
  const now = new Date();
  const endDate = formatDate(now);

  switch (preset) {
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { startDate: formatDate(start), endDate, preset };
    }
    case 'last14': {
      const start = new Date(now);
      start.setDate(start.getDate() - 14);
      return { startDate: formatDate(start), endDate, preset };
    }
    case 'mtd': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: formatDate(start), endDate, preset };
    }
    case 'custom': {
      return {
        startDate: customStart || formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: customEnd || endDate,
        preset,
      };
    }
  }
}

export function getPresetLabel(preset: DateRange): string {
  switch (preset) {
    case 'last7': return 'Last 7 Days';
    case 'last14': return 'Last 14 Days';
    case 'mtd': return 'Month to Date';
    case 'custom': return 'Custom Range';
  }
}
