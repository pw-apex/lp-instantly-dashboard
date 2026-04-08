'use client';

import { useState, useEffect, useMemo } from 'react';
import FunnelDayRow from './FunnelDayRow';
import { GA_HOURLY_DATA } from '@/lib/ga-data';
import {
  filterGAHourlyByDateRange,
  buildFunnelDayRows,
} from '@/lib/ga-aggregation';
import type {
  Campaign,
  DailyAnalytics,
  EmailBucket,
  EmailDetailResponse,
  FunnelDayRow as FunnelDayRowType,
} from '@/lib/types';

const MIN_SUBMITS_OPTIONS = [0, 1, 2, 3, 5, 10];
const MIN_EMAILS_OPTIONS = [0, 10, 20, 30, 50, 100];

type ScannerFunnelProps = {
  campaigns: Campaign[];
  startDate: string;
  endDate: string;
  dailyData: DailyAnalytics[];
};

export default function ScannerFunnel({ campaigns, startDate, endDate, dailyData }: ScannerFunnelProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [emailBuckets, setEmailBuckets] = useState<EmailBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState(false);
  const [minFormSubmits, setMinFormSubmits] = useState(3);
  const [minEmails, setMinEmails] = useState(30);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEmailData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        });
        if (selectedCampaignId) {
          params.set('campaign_id', selectedCampaignId);
        }

        const res = await fetch(`/api/emails/hourly?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('Failed to fetch email data');
        }
        const result: EmailDetailResponse = await res.json();
        setEmailBuckets(result.data);
        setPartial(result.partial);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEmailData();
    return () => controller.abort();
  }, [startDate, endDate, selectedCampaignId, retryKey]);

  const campaignNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of campaigns) {
      map.set(c.id, c.name);
    }
    return map;
  }, [campaigns]);

  const filteredGA = useMemo(
    () => filterGAHourlyByDateRange(GA_HOURLY_DATA, startDate, endDate),
    [startDate, endDate],
  );

  const dailyOpens = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of dailyData) {
      map.set(d.date, d.unique_opened);
    }
    return map;
  }, [dailyData]);

  const allRows: FunnelDayRowType[] = useMemo(
    () => buildFunnelDayRows(emailBuckets, filteredGA, campaignNames, dailyOpens),
    [emailBuckets, filteredGA, campaignNames, dailyOpens],
  );

  const filteredRows = useMemo(
    () => allRows.filter((r) => r.formSubmits >= minFormSubmits && r.emailsSent >= minEmails),
    [allRows, minFormSubmits, minEmails],
  );

  const activeCampaigns = campaigns.filter((c) => c.status === 1);

  return (
    <section className="bg-surface rounded-lg border border-border-default overflow-hidden">
      <div className="px-6 py-4 border-b border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-text-heading">Scanner Funnel Performance</h3>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Min emails filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-body">
              Min Emails
            </span>
            <select
              value={minEmails}
              onChange={(e) => setMinEmails(Number(e.target.value))}
              className="text-xs bg-surface-elevated border-none rounded-md px-2 py-1 mono text-text-heading"
            >
              {MIN_EMAILS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'All' : `≥ ${n}`}
                </option>
              ))}
            </select>
          </div>

          {/* Form submit filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-body">
              Min Submits
            </span>
            <select
              value={minFormSubmits}
              onChange={(e) => setMinFormSubmits(Number(e.target.value))}
              className="text-xs bg-surface-elevated border-none rounded-md px-2 py-1 mono text-text-heading"
            >
              {MIN_SUBMITS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'All' : `≥ ${n}`}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign selector */}
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="text-xs bg-surface-elevated border-none rounded-md px-2 py-1 text-text-heading max-w-[200px]"
          >
            <option value="">All Campaigns</option>
            {activeCampaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-text-muted">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-fill)' }}
            />
            Loading email data...
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-text-muted">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 bg-text-heading rounded-lg text-sm font-medium text-bg hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-surface-elevated border-b border-border-default">
                  <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest text-text-body font-bold">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">
                    Emails Sent
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">
                    Opens
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">
                    Sessions
                  </th>
                  <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest text-text-body font-bold">
                    Form Submits
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-text-muted text-sm">
                      No days match the current filters
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <FunnelDayRow key={row.date} row={row} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {partial && (
            <div className="px-6 py-3 border-t border-border-default">
              <p className="text-[10px] text-text-muted">
                Email data may be incomplete — API pagination limit reached
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
