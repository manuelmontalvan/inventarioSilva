"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { SummaryCardsProps } from "@/types/prediction";

export default function SummaryCards({
  loading,
  totalSales,
  productName,
  days,
  brand,
  unit,
  tendency,
  alertRestock,
  percentChange,
  multiModel,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Proyección de ventas por modelo */}
      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Proyección de Ventas
            </span>
            <BarChart className="w-5 h-5 text-blue-500" />
          </div>

          {loading ? (
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">
              Cargando...
            </p>
          ) : multiModel ? (
            <div className="flex flex-col gap-1">
              {Object.entries(multiModel).map(([modelName, model]) => {
                const totalSales =
                  model?.forecast?.reduce((acc, p) => acc + p.yhat, 0) ?? 0;
                return (
                  <div
                    key={modelName}
                    className="flex justify-between font-semibold text-gray-800 dark:text-white"
                  >
                    <span className="capitalize">{modelName}</span>
                    <span>{totalSales.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">
              {Math.round(totalSales)}
            </p>
          )}

          {percentChange !== null && percentChange !== undefined && (
            <p
              className={`text-sm flex items-center gap-1 ${
                percentChange > 0
                  ? "text-green-600"
                  : percentChange < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {percentChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : percentChange < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4 rotate-90" />
              )}
              {percentChange > 0 ? "+" : ""}
              {percentChange.toFixed(2)}% respecto al mes anterior
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Detalles</span>
            <LineChart className="w-5 h-5 text-purple-500" />
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {productName}
            </p>
            <p className="text-sm text-gray-500">
              Proyección: {days} {days === 1 ? "día" : "días"}
            </p>
          </div>

          <div>
            <p className="text-sm">
              {brand} / {unit}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Múltiples modelos */}
      {multiModel &&
        Object.entries(multiModel).map(([modelName, modelData]) => (
          <Card key={modelName} className="shadow-md">
            <CardContent className="flex flex-col gap-2 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Modelo: {modelName.toUpperCase()}
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

              {modelData.metrics &&
                typeof modelData.metrics.MAE === "number" &&
                typeof modelData.metrics.RMSE === "number" && (
                  <div className="text-xs text-gray-600">
                    <p>MAE: {modelData.metrics.MAE.toFixed(2)}</p>
                    <p>RMSE: {modelData.metrics.RMSE.toFixed(2)}</p>
                    <p
                      className={
                        modelData.metrics.MAE < 100
                          ? "text-green-600 font-semibold mt-1"
                          : modelData.metrics.MAE < 300
                          ? "text-yellow-600 font-semibold mt-1"
                          : "text-red-600 font-semibold mt-1"
                      }
                    >
                      {modelData.metrics.MAE < 100
                        ? "✅ Modelo confiable"
                        : modelData.metrics.MAE < 300
                        ? "⚠️ Modelo aceptable"
                        : "🚨 Modelo poco confiable"}
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
