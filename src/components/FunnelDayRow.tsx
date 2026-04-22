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
      <td className="py-4 px-6 text-sm font-medium text-text-heading whitespace-nowrap">{dateLabel}</td>
      <td className="py-4 px-4">
        {row.campaigns.length === 0 ? (
          <span className="text-xs text-text-muted">—</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {row.campaigns.map((c) => (
              <span
                key={c.campaignId}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-elevated text-xs text-text-heading"
              >
                <span className="truncate max-w-[180px]">{c.campaignName}</span>
                <span className="mono text-text-body">{c.sent.toLocaleString()}</span>
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="py-4 px-4 mono text-sm text-right">{row.emailsSent.toLocaleString()}</td>
      <td className="py-4 px-4 mono text-sm text-right">{row.sessions.toLocaleString()}</td>
      <td className="py-4 px-4 mono text-sm text-right font-semibold">{row.formSubmits.toLocaleString()}</td>
      <td className="py-4 px-6 mono text-sm text-right">{row.bookings.toLocaleString()}</td>
    </tr>
  );
}
