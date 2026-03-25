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

interface StepChartProps {
  steps: StepAnalytics[];
}

export default function StepChart({ steps }: StepChartProps) {
  const chartData = steps.map((s) => ({
    name: `Step ${s.stepNumber}`,
    'Open Rate': Number(s.openRate.toFixed(1)),
    isBest: s.isBestOpen,
    isWorst: s.isWorstOpen,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" barSize={20}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) => `${value}%`}
            contentStyle={{
              background: '#1a1a35',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="Open Rate" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isBest ? '#22c55e' : entry.isWorst ? '#ef4444' : '#f59e0b'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
