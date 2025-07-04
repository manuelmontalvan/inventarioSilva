"use client";

import React from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SalesChartProps {
  data: { name: string; ventas: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Proyección de ventas (Próximos días)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <ReLineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ fontWeight: "bold", color: "#374151" }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Ventas estimadas"
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
