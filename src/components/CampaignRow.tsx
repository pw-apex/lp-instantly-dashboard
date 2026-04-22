'use client';

import { useState } from 'react';
import StatusBadge from './ui/StatusBadge';
import StepChart from './charts/StepChart';
import type { CampaignWithAnalytics, StepAnalytics } from '@/lib/types';

type CampaignRowProps = {
  campaign: CampaignWithAnalytics;
};

export default function CampaignRow({ campaign }: CampaignRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<StepAnalytics[] | null>(null);
  const [loading, setLoading] = useState(false);

  const a = campaign.analytics;
  const sent = a?.emails_sent_count ?? 0;
  const newContacts = a?.new_leads_contacted_count ?? 0;
  const opens = a?.open_count_unique ?? 0;
  const replies = a?.reply_count_unique ?? a?.reply_count ?? 0;
  const clicks = a?.link_click_count_unique ?? a?.link_click_count ?? 0;
  const bounces = a?.bounced_count ?? 0;

  const openRate = campaign.open_tracking && sent > 0 ? ((opens / sent) * 100).toFixed(1) : null;
  const replyRate = newContacts > 0 ? ((replies / newContacts) * 100).toFixed(1) : '0.0';
  const bounceRate = sent > 0 ? ((bounces / sent) * 100).toFixed(1) : '0.0';
  const clickRate = campaign.link_tracking && sent > 0 ? ((clicks / sent) * 100).toFixed(1) : null;

  async function toggleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!steps) {
      setLoading(true);
      try {
        const res = await fetch(`/api/campaigns/${campaign.id}/emails`);
        if (!res.ok) {
          setSteps([]);
          return;
        }
        const data = await res.json();
        setSteps(data.steps || []);
      } catch {
        setSteps([]);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <tr
        onClick={toggleExpand}
        className="hover:bg-hover cursor-pointer transition-colors group"
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
            <span className="text-sm font-medium text-text-heading truncate max-w-xs">{campaign.name}</span>
          </div>
        </td>
        <td className="py-4 px-4"><StatusBadge status={campaign.status} /></td>
        <td className="py-4 px-4 mono text-sm text-right">{sent.toLocaleString()}</td>
        <td className="py-4 px-4 mono text-sm text-right">{newContacts.toLocaleString()}</td>
        <td className="py-4 px-4 mono text-sm text-right">
          {openRate !== null ? (
            <span>{openRate}%</span>
          ) : (
            <span className="text-text-muted">off</span>
          )}
        </td>
        <td className="py-4 px-4 mono text-sm text-right">{replyRate}%</td>
        <td className="py-4 px-4 mono text-sm text-right">{bounceRate}%</td>
        <td className="py-4 px-6 mono text-sm text-right font-semibold">
          {clickRate !== null ? (
            <span>{clickRate}%</span>
          ) : (
            <span className="text-text-muted">off</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-l-4 border-l-text-heading">
          <td colSpan={8} className="p-6 bg-bg">
            {loading ? (
              <div className="flex items-center gap-2 text-text-muted text-sm py-4">
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-fill)' }} />
                Loading per-step analytics...
              </div>
            ) : steps && steps.length > 0 ? (
              <div className="bg-surface-elevated rounded-lg p-6 border border-border-default">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Step-by-Step Open Rates */}
                  <div className="col-span-1">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-text-body mb-4">
                      Step-by-Step Open Rates
                    </h4>
                    <div className="space-y-4">
                      {steps.filter(s => s.sentCount > 0).map((step) => (
                        <div key={`bar-${step.stepIndex}-${step.variant}`} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium mb-1">
                            <span className="text-text-heading">Step {step.stepNumber}: {step.subject || 'Untitled'}</span>
                            <span className="mono text-text-heading">{step.openRate.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-default)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(step.openRate, 100)}%`,
                                backgroundColor: step.isBestOpen ? 'var(--chart-best)' : step.isWorstOpen ? 'var(--chart-worst)' : 'var(--chart-primary)',
                              }}
                            />
                          </div>
                          {step.isBestOpen && (
                            <span
                              className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-sm mt-1"
                              style={{ backgroundColor: 'var(--badge-best-bg)', color: 'var(--badge-best-text)' }}
                            >
                              BEST
                            </span>
                          )}
                          {step.isWorstOpen && (
                            <span
                              className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-sm mt-1"
                              style={{ backgroundColor: 'var(--badge-worst-bg)', color: 'var(--badge-worst-text)' }}
                            >
                              LOWEST
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Detail Table */}
                  <div className="col-span-2">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-text-body border-b border-border-default">
                          <th className="py-2 font-bold text-left">STEP #</th>
                          <th className="py-2 font-bold text-left">SUBJECT</th>
                          <th className="py-2 font-bold text-right">SENT</th>
                          <th className="py-2 font-bold text-right">OPENED</th>
                          <th className="py-2 font-bold text-right">OPENS</th>
                          <th className="py-2 font-bold text-right">REPLIES</th>
                          <th className="py-2 font-bold text-right">OPPS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-default/50 mono">
                        {steps.map((step) => (
                          <tr key={`table-${step.stepIndex}-${step.variant}`}>
                            <td className="py-3 text-text-heading">{step.stepNumber}</td>
                            <td className="py-3 font-sans font-medium text-text-heading">{step.subject || 'Untitled'}</td>
                            <td className="py-3 text-right">{step.sentCount.toLocaleString()}</td>
                            <td className="py-3 text-right">{step.openedCount.toLocaleString()}</td>
                            <td className="py-3 text-right">{step.openRate > 0 ? `${step.openRate.toFixed(0)}%` : '—'}</td>
                            <td className="py-3 text-right">{step.replyCount.toLocaleString()}</td>
                            <td className="py-3 text-right">{step.opportunityCount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-text-muted text-sm py-4">No step data available for this campaign.</div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
