import React from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  data: { name: string; ventas: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Proyección de ventas (Próximos días)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={2} />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
