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
import type { FunnelHourlyRecord, FunnelDailyRecord } from '@/lib/types';
import { useChartTheme } from '@/lib/useChartTheme';

const HOUR_LABELS = [
  '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
  '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p',
];

type FunnelChartProps = {
  hourlyData: FunnelHourlyRecord[];
  dailyData: FunnelDailyRecord[];
  view: 'hourly' | 'daily';
  partial?: boolean;
};

export default function FunnelChart({ hourlyData, dailyData, view, partial }: FunnelChartProps) {
  const theme = useChartTheme();

  const chartData = view === 'hourly'
    ? hourlyData.map((d) => ({
        label: HOUR_LABELS[d.hour],
        'Emails Sent': d.emailsSent,
        Sessions: d.sessions,
        'Form Submits': d.formSubmits,
      }))
    : dailyData.map((d) => ({
        label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Emails Sent': d.emailsSent,
        Sessions: d.sessions,
        'Form Submits': d.formSubmits,
      }));

  return (
    <div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={theme.tooltipStyle} />
            <Bar yAxisId="left" dataKey="Emails Sent" fill={theme.chart2} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="Form Submits" fill={theme.gaFormSubmits} radius={[2, 2, 0, 0]} barSize={8} />
            <Line yAxisId="right" type="monotone" dataKey="Sessions" stroke={theme.gaSessions} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {partial && (
        <p className="text-[10px] text-text-muted mt-2">
          Data may be incomplete — API pagination limit reached
        </p>
      )}
    </div>
  );
}
