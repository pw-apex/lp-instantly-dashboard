'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyAnalytics } from '@/lib/types';

type EngagementChartProps = {
  data: DailyAnalytics[];
};

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#09090b',
};

export default function EngagementChart({ data }: EngagementChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Unique Opens': d.unique_opened,
    Replies: d.replies,
  }));

  return (
    <div className="bg-white rounded-lg border border-[#e4e4e7] p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-medium text-[#09090b]">Engagement</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-[2px] bg-[#d4d4d8]" />
            <span className="text-[10px] font-medium text-[#52525b] uppercase">Unique Opens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-[2px] bg-[#09090b]" />
            <span className="text-[10px] font-medium text-[#52525b] uppercase">Replies</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <defs>
              <linearGradient id="openGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4d4d8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d4d4d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="replyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#09090b" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#09090b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="Unique Opens"
              stroke="#d4d4d8"
              fill="url(#openGradient)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="Replies"
              stroke="#09090b"
              fill="url(#replyGradient)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
