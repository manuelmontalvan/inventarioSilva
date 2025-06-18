// app/products/analytics/page.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { name: "Ene", ventas: 1200 },
  { name: "Feb", ventas: 1800 },
  { name: "Mar", ventas: 2400 },
  { name: "Abr", ventas: 2100 },
  { name: "May", ventas: 2900 },
  { name: "Jun", ventas: 3400 },
];

export default function PredictiveAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Análisis Predictivo</h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
        Bienvenido al módulo de análisis predictivo. Aquí podrás visualizar proyecciones de ventas, tendencias de productos y otros insights relevantes que te ayudarán a tomar decisiones informadas.
      </p>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Proyección de Ventas</span>
              <BarChart className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">$34,500</p>
            <p className="text-sm text-green-500 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +15% respecto al mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Producto Destacado</span>
              <LineChart className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">Taladro Eléctrico</p>
            <p className="text-sm text-gray-500">Proyección: 1,200 unidades</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Nivel de stock crítico</span>
              <LineChart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">4 productos</p>
            <p className="text-sm text-gray-500">Reponer antes de fin de mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de línea */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Proyección de ventas (Próximos meses)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ReLineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={2} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
