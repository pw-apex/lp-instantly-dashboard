'use client';

import { useState } from 'react';
import type { FunnelDayRow as FunnelDayRowType } from '@/lib/types';

const HOUR_LABELS = [
  '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
  '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p',
];

type FunnelDayRowProps = {
  row: FunnelDayRowType;
};

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
            {/* Hourly Activity Correlation */}
            {row.hourly.length > 0 && (
              <div className="bg-surface-elevated rounded-lg p-5 border border-border-default mb-6">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-text-body mb-3">
                  Hourly Activity
                </h4>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-text-body border-b border-border-default">
                      <th className="py-2 font-bold text-left">Hour</th>
                      <th className="py-2 font-bold text-right">Sent</th>
                      <th className="py-2 font-bold text-right">Sessions</th>
                      <th className="py-2 font-bold text-right">Form Submits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default/50 mono">
                    {row.hourly.map((h) => (
                      <tr key={h.hour}>
                        <td className="py-2 text-text-heading">{HOUR_LABELS[h.hour]}</td>
                        <td className="py-2 text-right">{h.sent > 0 ? h.sent.toLocaleString() : '—'}</td>
                        <td className="py-2 text-right">{h.sessions > 0 ? h.sessions.toLocaleString() : '—'}</td>
                        <td className="py-2 text-right font-semibold">
                          {h.formSubmits > 0 ? h.formSubmits.toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Campaign Breakdown */}
            {row.campaigns.length === 0 ? (
              <div className="text-text-muted text-sm">No email data for this day.</div>
            ) : (
              <div className="space-y-6">
                {row.campaigns.map((campaign) => (
                  <div
                    key={campaign.campaignId}
                    className="bg-surface-elevated rounded-lg p-5 border border-border-default"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-semibold text-text-heading truncate max-w-md">
                        {campaign.campaignName}
                      </h4>
                      <span className="text-[10px] mono text-text-muted">
                        {campaign.emailsSent.toLocaleString()} emails
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Steps / Sequence Emails */}
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest font-bold text-text-body mb-3">
                          Sequence Emails Sent
                        </h5>
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="text-text-body border-b border-border-default">
                              <th className="py-2 font-bold text-left">Step</th>
                              <th className="py-2 font-bold text-left">Subject</th>
                              <th className="py-2 font-bold text-right">Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-default/50 mono">
                            {campaign.steps.map((s) => (
                              <tr key={s.step}>
                                <td className="py-2 text-text-heading">{s.stepNumber}</td>
                                <td className="py-2 font-sans font-medium text-text-heading truncate max-w-xs">
                                  {s.subject}
                                </td>
                                <td className="py-2 text-right">{s.count.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Campaign Hourly Send Pills */}
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest font-bold text-text-body mb-3">
                          Send Times
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {campaign.hours.map((h) => (
                            <span
                              key={h.hour}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] mono bg-bg border border-border-default text-text-heading"
                            >
                              <span className="text-text-muted">{HOUR_LABELS[h.hour]}</span>
                              <span className="font-semibold">{h.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
