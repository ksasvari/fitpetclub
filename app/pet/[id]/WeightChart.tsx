// app/pet/[id]/WeightChart.tsx
'use client';   // <-- forces this file to be a client component

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

type Weight = {
  id: number;
  weightKg: number;
  measuredAt: string; // ISO timestamp
};

type Props = {
  weights: Weight[];
};

export default function WeightChart({ weights }: Props) {
  // Transform data for Recharts
  const chartData = weights.map((w) => ({
    date: new Date(w.measuredAt).toLocaleDateString(),
    weight: w.weightKg,
  }));

  // Need at least two points to draw a line
  if (chartData.length < 2) {
    return <p>Not enough data points to draw a chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#3498db"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
