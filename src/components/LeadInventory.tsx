'use client';

import type { LeadInventory as LeadInventoryType } from '@/lib/types';

type LeadInventoryProps = {
  inventory: LeadInventoryType[];
  threshold?: number;
};

export default function LeadInventory({ inventory, threshold = 500 }: LeadInventoryProps) {
  const sorted = [...inventory].sort((a, b) => a.remaining - b.remaining);

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-[#09090b]">Lead Inventory</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[#a1a1aa] text-sm">
            No active campaigns with lead data
          </div>
        ) : (
          sorted.map((item) => (
            <div
              key={item.campaignId}
              className="bg-white p-5 rounded-lg border border-[#e4e4e7] hover:border-[#a1a1aa] transition-all relative"
            >
              {item.isLow && (
                <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red" />
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-[#09090b]">{item.campaignName}</span>
              </div>
              <div className="w-full bg-[#f4f4f5] h-1 rounded-full mb-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(item.percentContacted, 100)}%`,
                    backgroundColor: item.isLow ? '#ef4444' : '#09090b',
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#52525b]">
                  {item.contacted.toLocaleString()} / {item.totalLeads.toLocaleString()} Contacted
                </span>
                <span className={`mono text-xs font-medium ${item.isLow ? 'text-red font-semibold' : 'text-[#09090b]'}`}>
                  {item.remaining.toLocaleString()} Remaining
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
