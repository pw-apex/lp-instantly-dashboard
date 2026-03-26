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
import { useChartTheme } from '@/lib/useChartTheme';

type VolumeChartProps = {
  data: DailyAnalytics[];
};

export default function VolumeChart({ data }: VolumeChartProps) {
  const theme = useChartTheme();

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'New Contacts': d.new_leads_contacted,
    'Follow-ups': d.sent - d.new_leads_contacted,
  }));

  return (
    <div className="bg-surface rounded-lg border border-border-default p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-medium text-text-heading">Send Volume</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.chart1 }} />
            <span className="text-[10px] font-medium text-text-body uppercase">New Contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.chart2 }} />
            <span className="text-[10px] font-medium text-text-body uppercase">Follow-ups</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={theme.tooltipStyle} />
            <Bar dataKey="New Contacts" stackId="a" fill={theme.chart1} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Follow-ups" stackId="a" fill={theme.chart2} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
