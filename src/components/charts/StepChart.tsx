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
import type { StepAnalytics } from '@/lib/types';

interface StepChartProps {
  steps: StepAnalytics[];
}

export default function StepChart({ steps }: StepChartProps) {
  const chartData = steps
    .filter(s => s.sentCount > 0)
    .map((s) => ({
      name: `Step ${s.stepNumber}`,
      Sent: s.sentCount,
      subject: s.subject,
      replies: s.replyCount,
    }));

  if (chartData.length === 0) return null;

  return (
    <div style={{ height: Math.max(80, chartData.length * 28 + 20) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" barSize={14}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
            labelFormatter={(label) => {
              const step = chartData.find(d => d.name === label);
              return step?.subject || label;
            }}
          />
          <Bar dataKey="Sent" fill="#f59e0b" radius={[0, 4, 4, 0]} background={{ fill: 'rgba(255,255,255,0.03)' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
