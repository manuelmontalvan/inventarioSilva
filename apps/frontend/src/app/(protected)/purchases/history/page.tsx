"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CostData {
  date: string;
  cost: number;
}

interface ProductCostHistory {
  name: string;
  data: CostData[];
}

export default function ProductCostHistoryChart() {
  const [data, setData] = useState<ProductCostHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<ProductCostHistory[]>("http://localhost:3001/api/analytics/product-cost-history")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando datos...</p>;

  // Obtener todas las fechas únicas ordenadas (para labels)
  const allDates = Array.from(
    new Set(data.flatMap((p) => p.data.map((d) => d.date)))
  ).sort();

  // Construir datasets para Chart.js
  const datasets = data.map((product, index) => ({
    label: product.name,
    data: allDates.map((date) => {
      const dayData = product.data.find((d) => d.date === date);
      return dayData ? dayData.cost : null;
    }),
    borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
    backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%, 0.5)`,
    spanGaps: true,
  }));

  const chartData = {
    labels: allDates,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Historial de Costos por Producto",
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Costo (USD)",
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: "Fecha",
        },
      },
    },
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Line options={options} data={chartData} />
    </div>
  );
}
