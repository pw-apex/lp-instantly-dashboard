'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CorrelatedDailyRecord } from '@/lib/types';
import { useChartTheme } from '@/lib/useChartTheme';

type CorrelationChartProps = {
  data: CorrelatedDailyRecord[];
};

export default function CorrelationChart({ data }: CorrelationChartProps) {
  const theme = useChartTheme();

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'New Contacts': d.newContacts,
    'Follow-ups': d.sent - d.newContacts,
    Sessions: d.sessions,
    'Form Submits': d.formSubmits,
  }));

  return (
    <div className="bg-surface rounded-lg border border-border-default p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-medium text-text-heading">Email Sends vs. LP Sessions</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.chart1 }} />
            <span className="text-[10px] font-medium text-text-body uppercase">New Contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.chart2 }} />
            <span className="text-[10px] font-medium text-text-body uppercase">Follow-ups</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-[2px]" style={{ backgroundColor: theme.gaSessions }} />
            <span className="text-[10px] font-medium text-text-body uppercase">Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.gaFormSubmits }} />
            <span className="text-[10px] font-medium text-text-body uppercase">Form Submits</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={theme.tooltipStyle} />
            <Bar yAxisId="left" dataKey="New Contacts" stackId="sends" fill={theme.chart1} radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="Follow-ups" stackId="sends" fill={theme.chart2} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="Form Submits" fill={theme.gaFormSubmits} radius={[2, 2, 0, 0]} barSize={8} />
            <Line yAxisId="right" type="monotone" dataKey="Sessions" stroke={theme.gaSessions} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
