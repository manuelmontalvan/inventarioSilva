"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
 
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
  currentQuantity,
  modelName,
  model,
}: SummaryCardsProps) {
  return (
    <Card className="shadow-md">
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Modelo: {modelName?.toUpperCase()}
          </span>
          <ClipboardList className="w-5 h-5 text-orange-500" />
        </div>

        <p className="text-sm text-gray-500">
          {brand} / {unit} - {productName} ({days} días)
        </p>

        {loading ? (
          <p className="text-2xl font-semibold text-gray-800 dark:text-white">
            Cargando...
          </p>
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
            {percentChange.toFixed(2)}%
          </p>
        )}

        {tendency && (
          <p className="text-sm">
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
            {currentQuantity !== undefined && (
              <span className="ml-1 text-xs text-gray-500">
                (Stock actual: {currentQuantity})
              </span>
            )}
          </p>
        )}

        {model?.metrics &&
          typeof model.metrics.MAE === "number" &&
          typeof model.metrics.RMSE === "number" && (
            <div className="text-xs text-gray-600">
              <p>MAE: {model.metrics.MAE.toFixed(2)}</p>
              <p>RMSE: {model.metrics.RMSE.toFixed(2)}</p>
              <p
                className={
                  model.metrics.MAE < 100
                    ? "text-green-600 font-semibold mt-1"
                    : model.metrics.MAE < 300
                    ? "text-yellow-600 font-semibold mt-1"
                    : "text-red-600 font-semibold mt-1"
                }
              >
                {model.metrics.MAE < 100
                  ? "✅ Modelo confiable"
                  : model.metrics.MAE < 300
                  ? "⚠️ Modelo aceptable"
                  : "🚨 Modelo poco confiable"}
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
