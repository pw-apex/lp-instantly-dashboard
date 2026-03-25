'use client';

import { useState } from 'react';
import StatusBadge from './ui/StatusBadge';
import StepChart from './charts/StepChart';
import type { CampaignWithAnalytics, StepAnalytics } from '@/lib/types';

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
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-300">Per-Step Performance</h4>
                <StepChart steps={steps} />
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase">
                      <th className="text-left py-2 px-3">Step</th>
                      <th className="text-left py-2 px-3">Subject</th>
                      <th className="text-right py-2 px-3">Sent</th>
                      <th className="text-right py-2 px-3">Opened</th>
                      <th className="text-right py-2 px-3">Open %</th>
                      <th className="text-right py-2 px-3">Replies</th>
                      <th className="text-right py-2 px-3">Clicks</th>
                      <th className="text-right py-2 px-3">Insight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step) => (
                      <tr key={step.step} className="border-t border-white/5">
                        <td className="py-2 px-3 mono text-slate-300">Step {step.stepNumber}</td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-[200px]">{step.subject}</td>
                        <td className="py-2 px-3 mono text-right">{step.sentCount.toLocaleString()}</td>
                        <td className="py-2 px-3 mono text-right">{step.openedCount.toLocaleString()}</td>
                        <td className="py-2 px-3 mono text-right">
                          <span className={step.isBestOpen ? 'text-green' : step.isWorstOpen ? 'text-red' : 'text-amber'}>
                            {step.openRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 mono text-right text-green">{step.replyCount}</td>
                        <td className="py-2 px-3 mono text-right text-pink">{step.clickCount}</td>
                        <td className="py-2 px-3 text-right text-xs">
                          {step.isBestOpen && <span className="text-green">Best Open Rate</span>}
                          {step.isWorstOpen && <span className="text-red">Worst Open Rate</span>}
                          {step.isBestReply && !step.isBestOpen && <span className="text-green">Best Reply Rate</span>}
                          {step.isWorstReply && !step.isWorstOpen && <span className="text-red">Worst Reply Rate</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
