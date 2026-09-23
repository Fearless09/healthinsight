'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface GeographicDistributionChartProps {
  data?: Array<{ location: string; participants: number; completed: number; outcomeRate: number }>;
}

const DEFAULT_GEO_DATA = [
  { location: 'North District', participants: 350, completed: 295, outcomeRate: 84.3 },
  { location: 'Central Region', participants: 420, completed: 360, outcomeRate: 85.7 },
  { location: 'Southern Valley', participants: 380, completed: 290, outcomeRate: 76.3 },
  { location: 'East Coast', participants: 300, completed: 276, outcomeRate: 92.0 },
  { location: 'Highland Zone', participants: 250, completed: 200, outcomeRate: 80.0 },
];

export function GeographicDistributionChart({ data = DEFAULT_GEO_DATA }: GeographicDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
        <p>No geographic breakdown available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="location" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar dataKey="participants" name="Enrolled" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
