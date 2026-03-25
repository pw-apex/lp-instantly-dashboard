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
  const chartData = steps.map((s) => ({
    name: `Step ${s.stepNumber}`,
    Sent: s.sentCount,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" barSize={20}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: '#1a1a35',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="Sent" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
