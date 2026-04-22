'use client';

import { useState, useEffect, useMemo } from 'react';
import FunnelDayRow from './FunnelDayRow';
import { GA_DAILY_DATA } from '@/lib/ga-data';
import { filterGAByDateRange } from '@/lib/ga-aggregation';
import type {
  DailyCampaignSend,
  FunnelDayRow as FunnelDayRowType,
  GADailyRecord,
} from '@/lib/types';

const MIN_SUBMITS_OPTIONS = [0, 1, 2, 3, 5, 10];

type ScannerFunnelProps = {
  startDate: string;
  endDate: string;
};

type DailyResponse = { data: DailyCampaignSend[] };

function buildRows(
  sends: DailyCampaignSend[],
  ga: GADailyRecord[],
): FunnelDayRowType[] {
  const byDate = new Map<string, FunnelDayRowType>();

  for (const g of ga) {
    byDate.set(g.date, {
      date: g.date,
      emailsSent: 0,
      campaigns: [],
      sessions: g.sessions,
      formSubmits: g.formSubmits,
      bookings: g.bookingConfirmed,
    });
  }

  for (const s of sends) {
    let row = byDate.get(s.date);
    if (!row) {
      row = {
        date: s.date,
        emailsSent: 0,
        campaigns: [],
        sessions: 0,
        formSubmits: 0,
        bookings: 0,
      };
      byDate.set(s.date, row);
    }
    row.emailsSent += s.sent;
    row.campaigns.push({
      campaignId: s.campaignId,
      campaignName: s.campaignName,
      sent: s.sent,
    });
  }

  for (const row of byDate.values()) {
    row.campaigns.sort((a, b) => b.sent - a.sent);
  }

  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export default function ScannerFunnel({ startDate, endDate }: ScannerFunnelProps) {
  const [sends, setSends] = useState<DailyCampaignSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minFormSubmits, setMinFormSubmits] = useState(3);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        });
        const res = await fetch(`/api/emails/daily?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('Failed to fetch daily send data');
        }
        const result: DailyResponse = await res.json();
        setSends(result.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [startDate, endDate, retryKey]);

  const filteredGA = useMemo(
    () => filterGAByDateRange(GA_DAILY_DATA, startDate, endDate),
    [startDate, endDate],
  );

  const allRows = useMemo(() => buildRows(sends, filteredGA), [sends, filteredGA]);

  const filteredRows = useMemo(
    () => allRows.filter((r) => r.formSubmits >= minFormSubmits),
    [allRows, minFormSubmits],
  );

  return (
    <section className="bg-surface rounded-lg border border-border-default overflow-hidden">
      <div className="px-6 py-4 border-b border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-text-heading">Daily GA4 Performance</h3>
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-text-muted">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-fill)' }}
            />
            Loading daily send data...
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-surface-elevated border-b border-border-default">
                <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest text-text-body font-bold">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">
                  Campaigns Sending
                </th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">
                  Sent
                </th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">
                  Sessions
                </th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">
                  Form Submits
                </th>
                <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest text-text-body font-bold">
                  Bookings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-muted text-sm">
                    No days match the current filters
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => <FunnelDayRow key={row.date} row={row} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
