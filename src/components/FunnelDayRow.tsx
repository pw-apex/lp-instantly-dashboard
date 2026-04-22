'use client';

import type { FunnelDayRow as FunnelDayRowType } from '@/lib/types';

type FunnelDayRowProps = {
  row: FunnelDayRowType;
};

export default function FunnelDayRow({ row }: FunnelDayRowProps) {
  const dateLabel = new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr>
      <td className="py-4 px-6 text-sm font-medium text-text-heading">{dateLabel}</td>
      <td className="py-4 px-4 mono text-sm text-right">{row.emailsSent.toLocaleString()}</td>
      <td className="py-4 px-4 mono text-sm text-right">{row.opens.toLocaleString()}</td>
      <td className="py-4 px-4 mono text-sm text-right">{row.sessions.toLocaleString()}</td>
      <td className="py-4 px-6 mono text-sm text-right font-semibold">{row.formSubmits.toLocaleString()}</td>
    </tr>
  );
}
