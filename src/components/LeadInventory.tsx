'use client';

import type { LeadInventory as LeadInventoryType } from '@/lib/types';

interface LeadInventoryProps {
  inventory: LeadInventoryType[];
  threshold?: number;
}

export default function LeadInventory({ inventory, threshold = 500 }: LeadInventoryProps) {
  const sorted = [...inventory].sort((a, b) => a.remaining - b.remaining);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-slate-300">Lead Inventory</h3>
        <span className="text-xs text-slate-500">Active campaigns only | Alert threshold: {threshold}</span>
      </div>
      <div className="divide-y divide-white/5">
        {sorted.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-500 text-sm">
            No active campaigns with lead data
          </div>
        ) : (
          sorted.map((item) => (
            <div key={item.campaignId} className="px-5 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200 truncate">{item.campaignName}</span>
                  {item.isLow && (
                    <span className="flex items-center gap-1 text-xs text-red font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      LOW
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(item.percentContacted, 100)}%`,
                        backgroundColor: item.isLow ? '#ef4444' : item.percentContacted > 75 ? '#f59e0b' : '#6366f1',
                      }}
                    />
                  </div>
                  <span className="mono text-xs text-slate-400">{item.percentContacted.toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex gap-6 text-right shrink-0">
                <div>
                  <div className="text-xs text-slate-500">Total</div>
                  <div className="mono text-sm text-slate-300">{item.totalLeads.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Contacted</div>
                  <div className="mono text-sm text-cyan">{item.contacted.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Remaining</div>
                  <div className={`mono text-sm ${item.isLow ? 'text-red font-semibold' : 'text-slate-300'}`}>
                    {item.remaining.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
