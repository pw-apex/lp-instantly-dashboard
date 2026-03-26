'use client';

import { useState } from 'react';
import CampaignRow from './CampaignRow';
import StatusFilter from './ui/StatusFilter';
import type { CampaignWithAnalytics } from '@/lib/types';

interface CampaignTableProps {
  campaigns: CampaignWithAnalytics[];
}

const statusMap: Record<string, number> = {
  active: 1,
  paused: 2,
  completed: 3,
};

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? campaigns
    : campaigns.filter((c) => c.status === statusMap[filter]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-slate-300">Campaign Performance</h3>
        <StatusFilter value={filter} onChange={setFilter} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
              <th className="text-left py-3 px-4 font-medium">Campaign</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Sent</th>
              <th className="text-right py-3 px-4 font-medium">New</th>
              <th className="text-right py-3 px-4 font-medium">Opens</th>
              <th className="text-right py-3 px-4 font-medium">Open%</th>
              <th className="text-right py-3 px-4 font-medium">Clicks</th>
              <th className="text-right py-3 px-4 font-medium">Click%</th>
              <th className="text-right py-3 px-4 font-medium">Replies</th>
              <th className="text-right py-3 px-4 font-medium">Reply%</th>
              <th className="text-right py-3 px-4 font-medium">Bounces</th>
              <th className="text-right py-3 px-4 font-medium">Opps</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-8 text-slate-500 text-sm">
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
    </div>
  );
}
