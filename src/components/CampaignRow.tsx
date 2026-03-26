'use client';

import { useState } from 'react';
import StatusBadge from './ui/StatusBadge';
import StepChart from './charts/StepChart';
import type { CampaignWithAnalytics, StepAnalytics } from '@/lib/types';

function Pill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', minWidth: 56 }}>
      <span className="text-[8px] text-slate-600 uppercase tracking-wider">{label}</span>
      <span className="mono text-sm font-bold" style={{ color: color || '#e2e8f0' }}>{value}</span>
    </div>
  );
}

interface CampaignRowProps {
  campaign: CampaignWithAnalytics;
}

export default function CampaignRow({ campaign }: CampaignRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<StepAnalytics[] | null>(null);
  const [loading, setLoading] = useState(false);

  const a = campaign.analytics;
  const sent = a?.emails_sent_count ?? 0;
  const newContacts = a?.new_leads_contacted_count ?? 0;
  const opens = a?.open_count_unique ?? 0;
  const replies = a?.reply_count_unique ?? a?.reply_count ?? 0;
  const clicks = a?.link_click_count ?? 0;
  const bounces = a?.bounced_count ?? 0;
  const opportunities = a?.total_opportunities ?? 0;

  const openRate = campaign.open_tracking && sent > 0 ? ((opens / sent) * 100).toFixed(1) : null;
  const replyRate = newContacts > 0 ? ((replies / newContacts) * 100).toFixed(1) : '0.0';
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
          console.error('Step analytics API error:', res.status);
          setSteps([]);
          return;
        }
        const data = await res.json();
        setSteps(data.steps || []);
      } catch (err) {
        console.error('Step analytics fetch error:', err);
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
        className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <svg
              className={`w-3 h-3 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-slate-200 truncate max-w-xs">{campaign.name}</span>
          </div>
        </td>
        <td className="py-3 px-4"><StatusBadge status={campaign.status} /></td>
        <td className="py-3 px-4 mono text-sm text-right">{sent.toLocaleString()}</td>
        <td className="py-3 px-4 mono text-sm text-right text-cyan">{newContacts.toLocaleString()}</td>
        <td className="py-3 px-4 mono text-sm text-right">{opens.toLocaleString()}</td>
        <td className="py-3 px-4 mono text-sm text-right">
          {openRate !== null ? (
            <span className="text-amber">{openRate}%</span>
          ) : (
            <span className="text-slate-600">off</span>
          )}
        </td>
        <td className="py-3 px-4 mono text-sm text-right">{clicks.toLocaleString()}</td>
        <td className="py-3 px-4 mono text-sm text-right">
          {clickRate !== null ? (
            <span className="text-pink">{clickRate}%</span>
          ) : (
            <span className="text-slate-600">off</span>
          )}
        </td>
        <td className="py-3 px-4 mono text-sm text-right text-green">{replies.toLocaleString()}</td>
        <td className="py-3 px-4 mono text-sm text-right text-green">{replyRate}%</td>
        <td className="py-3 px-4 mono text-sm text-right text-red">{bounces.toLocaleString()}</td>
        <td className="py-3 px-4 mono text-sm text-right text-emerald">{opportunities.toLocaleString()}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={12} className="bg-navy-900/50 px-8 py-4">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading per-step analytics...
              </div>
            ) : steps && steps.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <span>Step Analytics — {steps.length} steps</span>
                  {!campaign.open_tracking && <span className="text-red normal-case">open tracking disabled</span>}
                  {campaign.open_tracking && !campaign.link_tracking && <span className="text-slate-600 normal-case">link tracking off</span>}
                </div>

                {/* Horizontal bar chart for sent volume per step */}
                <StepChart steps={steps} />

                {/* Step rows */}
                <div className="space-y-1.5">
                  {steps.map((step, i) => {
                    const isInitial = i === 0;
                    return (
                      <div key={`${step.stepIndex}-${step.variant}`} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{
                            background: isInitial ? 'rgba(34,211,238,0.15)' : 'rgba(99,102,241,0.1)',
                            color: isInitial ? '#22d3ee' : '#818cf8',
                          }}
                        >
                          {step.stepNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold" style={{ color: isInitial ? '#22d3ee' : '#818cf8' }}>
                              {isInitial ? 'INITIAL' : `FU${i}`}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400 truncate">{step.subject}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Pill label="Sent" value={step.sentCount.toLocaleString()} />
                          <Pill label="Opened" value={step.openedCount.toLocaleString()} color={step.openedCount > 0 ? '#f59e0b' : undefined} />
                          <Pill label="Open%" value={step.openRate > 0 ? `${step.openRate.toFixed(1)}%` : '—'} color={step.isBestOpen ? '#22c55e' : step.isWorstOpen ? '#ef4444' : '#f59e0b'} />
                          <Pill label="Replied" value={step.replyCount.toLocaleString()} color={step.replyCount > 0 ? '#22c55e' : undefined} />
                          <Pill label="Clicked" value={step.clickCount.toLocaleString()} color={step.clickCount > 0 ? '#ec4899' : undefined} />
                          <Pill label="Opps" value={step.opportunityCount.toLocaleString()} color={step.opportunityCount > 0 ? '#10b981' : undefined} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Insight */}
                {steps.filter(s => s.sentCount > 10).length > 1 && (
                  <div className="space-y-1">
                    {(() => {
                      const withVolume = steps.filter(s => s.sentCount > 10);
                      const bestOpen = [...withVolume].sort((a, b) => b.openRate - a.openRate)[0];
                      const bestReply = [...withVolume].sort((a, b) => (b.replyCount / b.sentCount) - (a.replyCount / a.sentCount))[0];
                      return (
                        <>
                          {bestOpen && bestOpen.openRate > 0 && (
                            <div className="px-3 py-2 rounded-md text-xs" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                              <strong>Best open rate:</strong> Step {bestOpen.stepNumber} ({bestOpen.openRate.toFixed(1)}% — {bestOpen.openedCount.toLocaleString()} of {bestOpen.sentCount.toLocaleString()} sent)
                            </div>
                          )}
                          {bestReply && bestReply.replyCount > 0 && (
                            <div className="px-3 py-2 rounded-md text-xs" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', color: '#a5b4fc' }}>
                              <strong>Best reply rate:</strong> Step {bestReply.stepNumber} ({((bestReply.replyCount / bestReply.sentCount) * 100).toFixed(2)}% — {bestReply.replyCount} of {bestReply.sentCount.toLocaleString()} sent)
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-4">No step data available for this campaign.</div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
