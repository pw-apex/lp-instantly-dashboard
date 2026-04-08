'use client';

import { useState } from 'react';
import type { FunnelDayRow as FunnelDayRowType, FunnelHourSlot } from '@/lib/types';

const HOUR_LABELS = [
  '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am',
  '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm',
];

type FunnelDayRowProps = {
  row: FunnelDayRowType;
};

function HourRow({ slot }: { slot: FunnelHourSlot }) {
  const [open, setOpen] = useState(false);
  const hasEmails = slot.sent > 0;

  return (
    <>
      <tr
        onClick={hasEmails ? () => setOpen(!open) : undefined}
        className={hasEmails ? 'cursor-pointer hover:bg-hover transition-colors' : ''}
      >
        <td className="py-2 text-text-heading">
          <div className="flex items-center gap-1.5">
            {hasEmails ? (
              <svg
                className={`w-2.5 h-2.5 text-text-muted transition-transform ${open ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="w-2.5" />
            )}
            {HOUR_LABELS[slot.hour]}
          </div>
        </td>
        <td className="py-2 text-right">{slot.sent > 0 ? slot.sent.toLocaleString() : '—'}</td>
        <td className="py-2 text-right">{slot.sessions > 0 ? slot.sessions.toLocaleString() : '—'}</td>
        <td className="py-2 text-right font-semibold">
          {slot.formSubmits > 0 ? slot.formSubmits.toLocaleString() : '—'}
        </td>
      </tr>
      {open && slot.emails.length > 0 && (
        <tr>
          <td colSpan={4} className="pb-3 pt-0 pl-8">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-text-muted">
                  <th className="py-1 font-bold text-left">Step</th>
                  <th className="py-1 font-bold text-left">Subject</th>
                  <th className="py-1 font-bold text-left">Campaign</th>
                  <th className="py-1 font-bold text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {slot.emails.map((e, i) => (
                  <tr key={i} className="text-text-body">
                    <td className="py-0.5 mono">{e.stepNumber}</td>
                    <td className="py-0.5 font-medium text-text-heading truncate max-w-xs">{e.subject}</td>
                    <td className="py-0.5 text-text-muted truncate max-w-[160px]">{e.campaignName}</td>
                    <td className="py-0.5 mono text-right">{e.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export default function FunnelDayRow({ row }: FunnelDayRowProps) {
  const [expanded, setExpanded] = useState(false);

  const dateLabel = new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-hover cursor-pointer transition-colors"
      >
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            <svg
              className={`w-3 h-3 text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-text-heading">{dateLabel}</span>
          </div>
        </td>
        <td className="py-4 px-4 mono text-sm text-right">{row.emailsSent.toLocaleString()}</td>
        <td className="py-4 px-4 mono text-sm text-right">{row.opens.toLocaleString()}</td>
        <td className="py-4 px-4 mono text-sm text-right">{row.sessions.toLocaleString()}</td>
        <td className="py-4 px-6 mono text-sm text-right font-semibold">{row.formSubmits.toLocaleString()}</td>
      </tr>
      {expanded && (
        <tr className="border-l-4 border-l-text-heading">
          <td colSpan={5} className="p-6 bg-bg">
            {row.hourly.length > 0 ? (
              <div className="bg-surface-elevated rounded-lg p-5 border border-border-default">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-text-body mb-3">
                  Hourly Activity
                </h4>
                <table className="w-full text-[11px] mono">
                  <thead>
                    <tr className="text-text-body border-b border-border-default">
                      <th className="py-2 font-bold text-left">Hour</th>
                      <th className="py-2 font-bold text-right">Sent</th>
                      <th className="py-2 font-bold text-right">Sessions</th>
                      <th className="py-2 font-bold text-right">Form Submits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default/50">
                    {row.hourly.map((slot) => (
                      <HourRow key={slot.hour} slot={slot} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-text-muted text-sm">No hourly data for this day.</div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
