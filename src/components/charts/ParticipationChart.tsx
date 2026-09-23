'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ParticipationChartProps {
  data?: Array<{ date: string; participants: number; completed: number; referred: number }>;
}

const DEFAULT_DATA = [
  { date: 'Jan 2025', participants: 350, completed: 295, referred: 48 },
  { date: 'Feb 2025', participants: 420, completed: 360, referred: 65 },
  { date: 'Mar 2025', participants: 380, completed: 290, referred: 72 },
  { date: 'Apr 2025', participants: 300, completed: 276, referred: 30 },
  { date: 'May 2025', participants: 250, completed: 200, referred: 35 },
  { date: 'Jun 2025', participants: 400, completed: 350, referred: 42 },
];

export function ParticipationChart({ data = DEFAULT_DATA }: ParticipationChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
        <p>No participation trend data available for selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Area type="monotone" dataKey="participants" name="Enrolled Participants" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorParticipants)" />
          <Area type="monotone" dataKey="completed" name="Completed Programme" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
