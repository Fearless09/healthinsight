"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface CompletionRateChartProps {
  completionRate?: number;
  referralRate?: number;
}

export function CompletionRateChart({
  completionRate = 84.2,
  referralRate = 14.8,
}: CompletionRateChartProps) {
  const data = useMemo(() => {
    const otherRate = Math.max(0, 100 - (completionRate + referralRate));
    return [
      {
        name: "Completed ANC / Programme",
        value: completionRate,
        color: "#0d9488",
      },
      {
        name: "Referred to Specialist Care",
        value: referralRate,
        color: "#0284c7",
      },
      {
        name: "Incomplete / Lost to Follow-up",
        value: Math.round(otherRate * 10) / 10,
        color: "#64748b",
      },
    ];
  }, [completionRate, referralRate]);

  return (
    <div className="flex h-72 w-full flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="#0f172a"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: any) => [`${value}%`, "Percentage"]}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
