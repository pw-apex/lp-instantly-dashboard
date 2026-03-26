'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { StepAnalytics } from '@/lib/types';

type StepChartProps = {
  steps: StepAnalytics[];
};

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  fontSize: '11px',
  color: '#09090b',
};

export default function StepChart({ steps }: StepChartProps) {
  const chartData = steps
    .filter(s => s.sentCount > 0)
    .map((s) => ({
      name: `Step ${s.stepNumber}`,
      'Open Rate': parseFloat(s.openRate.toFixed(1)),
      subject: s.subject,
      sent: s.sentCount,
      opened: s.openedCount,
      isBest: s.isBestOpen,
      isWorst: s.isWorstOpen,
    }));

  if (chartData.length === 0) return null;

  return (
    <div style={{ height: Math.max(80, chartData.length * 32 + 20) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" barSize={16}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} unit="%" domain={[0, 'auto']} />
          <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [`${value}%`, 'Open Rate']}
            labelFormatter={(label) => {
              const step = chartData.find(d => d.name === label);
              return step ? `${step.subject} (${step.opened.toLocaleString()}/${step.sent.toLocaleString()} sent)` : label;
            }}
          />
          <Bar dataKey="Open Rate" radius={[0, 4, 4, 0]} background={{ fill: '#f4f4f5' }}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isBest ? '#09090b' : entry.isWorst ? '#a1a1aa' : '#52525b'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
