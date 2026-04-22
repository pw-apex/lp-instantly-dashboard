'use client';

import { useState } from 'react';
import CampaignRow from './CampaignRow';
import StatusFilter from './ui/StatusFilter';
import type { CampaignWithAnalytics } from '@/lib/types';

type CampaignTableProps = {
  campaigns: CampaignWithAnalytics[];
};

const statusMap: Record<string, number> = {
  active: 1,
  paused: 2,
  completed: 3,
};

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');

  const filtered = campaigns
    .filter((c) => filter === 'all' || c.status === statusMap[filter])
    .filter((c) => search === '' || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="bg-surface rounded-lg border border-border-default overflow-hidden">
      <div className="px-6 py-4 border-b border-border-default flex items-center justify-between">
        <StatusFilter value={filter} onChange={setFilter} />
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="pl-9 pr-4 py-1.5 bg-surface-elevated border-none text-xs rounded-lg focus:ring-1 focus:ring-border-default w-64 mono text-text-heading placeholder:text-text-muted"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-surface-elevated border-b border-border-default">
              <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest text-text-body font-bold">Campaign</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">Status</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">Sent</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">New</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">Open Rate</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">Reply Rate</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-text-body font-bold">Bounce Rate</th>
              <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest text-text-body font-bold">Click Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-text-muted text-sm">
                  No campaigns found
                </td>
              </tr>
            ) : (
              filtered.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
