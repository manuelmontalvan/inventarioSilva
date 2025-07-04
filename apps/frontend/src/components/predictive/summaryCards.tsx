import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, ArrowUpRight } from "lucide-react";

interface SummaryCardsProps {
  loading: boolean;
  totalSales: number;
  productName: string;
  days: number;
  brand: string;
  unit: string;
}

export default function SummaryCards({ loading, totalSales, productName, days, brand, unit }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Proyección de Ventas</span>
            <BarChart className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-800 dark:text-white">
            {loading ? "Cargando..." : `$${Math.round(totalSales)}`}
          </p>
          <p className="text-sm text-green-500 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            +15% respecto al mes anterior
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Producto</span>
            <LineChart className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{productName}</p>
          <p className="text-sm text-gray-500">Proyección: {days} {days === 1 ? "día" : "días"}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Marca y Unidad</span>
            <LineChart className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-sm">{brand} / {unit}</p>
          <p className="text-xs text-gray-400">Basado en ventas históricas</p>
        </CardContent>
      </Card>
    </div>
  );
}
