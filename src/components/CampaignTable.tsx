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
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = campaigns
    .filter((c) => filter === 'all' || c.status === statusMap[filter])
    .filter((c) => search === '' || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="bg-white rounded-lg border border-[#e4e4e7] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e4e4e7] flex items-center justify-between">
        <StatusFilter value={filter} onChange={setFilter} />
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]"
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
            className="pl-9 pr-4 py-1.5 bg-[#f4f4f5] border-none text-xs rounded-lg focus:ring-1 focus:ring-[#e4e4e7] w-64 mono"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-[#f4f4f5] border-b border-[#e4e4e7]">
              <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Campaign</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Status</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Sent</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">New</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Opens</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Open %</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Clicks</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Click %</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Replies</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Reply %</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Bounces</th>
              <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Opps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e4e7]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-8 text-[#a1a1aa] text-sm">
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
