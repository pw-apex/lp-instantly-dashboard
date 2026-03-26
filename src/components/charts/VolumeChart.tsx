'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyAnalytics } from '@/lib/types';

type VolumeChartProps = {
  data: DailyAnalytics[];
};

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#09090b',
};

export default function VolumeChart({ data }: VolumeChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'New Contacts': d.new_leads_contacted,
    'Follow-ups': d.sent - d.new_leads_contacted,
  }));

  return (
    <div className="bg-white rounded-lg border border-[#e4e4e7] p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-medium text-[#09090b]">Send Volume</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d4d4d8] rounded-sm" />
            <span className="text-[10px] font-medium text-[#52525b] uppercase">New Contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#52525b] rounded-sm" />
            <span className="text-[10px] font-medium text-[#52525b] uppercase">Follow-ups</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="New Contacts" stackId="a" fill="#d4d4d8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Follow-ups" stackId="a" fill="#52525b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
