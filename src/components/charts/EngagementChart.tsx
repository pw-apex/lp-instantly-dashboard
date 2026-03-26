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
import { useChartTheme } from '@/lib/useChartTheme';

type EngagementChartProps = {
  data: DailyAnalytics[];
};

export default function EngagementChart({ data }: EngagementChartProps) {
  const theme = useChartTheme();

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Unique Opens': d.unique_opened,
    Replies: d.replies,
  }));

  return (
    <div className="bg-surface rounded-lg border border-border-default p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-medium text-text-heading">Engagement</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-[2px]" style={{ backgroundColor: theme.engagementLine1 }} />
            <span className="text-[10px] font-medium text-text-body uppercase">Unique Opens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-[2px]" style={{ backgroundColor: theme.engagementLine2 }} />
            <span className="text-[10px] font-medium text-text-body uppercase">Replies</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={theme.tooltipStyle} />
            <defs>
              <linearGradient id="openGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.engagementLine1} stopOpacity={0.2} />
                <stop offset="95%" stopColor={theme.engagementLine1} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="replyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.engagementLine2} stopOpacity={0.1} />
                <stop offset="95%" stopColor={theme.engagementLine2} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="Unique Opens"
              stroke={theme.engagementLine1}
              fill="url(#openGradient)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="Replies"
              stroke={theme.engagementLine2}
              fill="url(#replyGradient)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
