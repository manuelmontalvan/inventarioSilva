"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

interface SummaryCardsProps {
  loading: boolean;
  totalSales: number;
  productName: string;
  days: number;
  brand: string;
  unit: string;
  tendency?: string;
  alertRestock?: boolean;
  metrics?: {
    MAE: number;
    RMSE: number;
  };
}

export default function SummaryCards({
  loading,
  totalSales,
  productName,
  days,
  brand,
  unit,
  tendency,
  alertRestock,
  metrics,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Proyección de ventas */}
      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Proyección de Ventas
            </span>
            <BarChart className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-800 dark:text-white">
            {loading ? "Cargando..." : `${Math.round(totalSales)}`}
          </p>
          <p className="text-sm text-green-500 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +15% respecto al mes anterior
          </p>
        </CardContent>
      </Card>

      {/* Producto y días */}
      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Producto</span>
            <LineChart className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {productName}
          </p>
          <p className="text-sm text-gray-500">
            Proyección: {days} {days === 1 ? "día" : "días"}
          </p>
        </CardContent>
      </Card>

      {/* Marca y Unidad */}
      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Marca y Unidad
            </span>
            <LineChart className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-sm">
            {brand} / {unit}
          </p>
          <p className="text-xs text-gray-400">Basado en ventas históricas</p>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Productos valido para compra
            </span>
            <LineChart className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-sm">
            {brand} / {unit}
          </p>
          <p className="text-xs text-gray-400">Basado en ventas históricas</p>
        </CardContent>
      </Card>

      {/* Tendencia, alerta, métricas */}
      {(tendency || alertRestock !== undefined || metrics) && (
        <Card className="shadow-md">
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Predicción
              </span>
              <ClipboardList className="w-5 h-5 text-orange-500" />
            </div>

            {tendency && (
              <p className="text-sm text-gray-700">
                Tendencia:{" "}
                <span
                  className={`font-semibold ${
                    tendency === "creciente"
                      ? "text-green-600"
                      : tendency === "decreciente"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {tendency}
                </span>
              </p>
            )}

            {alertRestock !== undefined && (
              <p
                className={`text-sm font-medium flex items-center gap-1 ${
                  alertRestock ? "text-red-600" : "text-green-600"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                {alertRestock ? "¡Reposición necesaria!" : "Stock suficiente"}
              </p>
            )}

            {metrics &&
              typeof metrics.MAE === "number" &&
              typeof metrics.RMSE === "number" && (
                <div className="text-xs text-gray-600">
                  <p>MAE: {metrics.MAE.toFixed(2)}</p>
                  <p>RMSE: {metrics.RMSE.toFixed(2)}</p>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
