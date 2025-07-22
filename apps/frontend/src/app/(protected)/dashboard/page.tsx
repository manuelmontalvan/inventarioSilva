"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getTopSoldProducts } from "@/lib/api/sales/productSales";
import { getTopPurchasedProducts } from "@/lib/api/purchases/purchaseOrders";
import {
  getMonthlySalesAndPurchases,
  getTotalProducts,
  getAvailableMonths,
} from "@/lib/api/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopProduct {
  productId: string;
  productName: string;
  brandName: string;
  unitName: string;
  totalQuantity: number;
}

interface MonthlySalesPurchases {
  month: string;
  totalPurchases: number;
  totalSales: number;
}

export default function DashboardPage() {
  const [topSales, setTopSales] = useState<TopProduct[]>([]);
  const [topPurchases, setTopPurchases] = useState<TopProduct[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlySalesPurchases[]>(
    []
  );
  const [totalProducts, setTotalProducts] = useState<number>(0);
const [loading, setLoading] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    // Cargar meses disponibles para llenar el dropdown
    const fetchMonths = async () => {
      const months = await getAvailableMonths(); // debe devolver string[] tipo ['2024-06', '2024-07', ...]
      setAvailableMonths(months);
      if (months.length > 0) setSelectedMonth(months[months.length - 1]); // por defecto el último mes
    };
    fetchMonths();
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    const fetchData = async () => {
      setLoading(true);
    try {
      const [sales, purchases, monthly, totalProd] = await Promise.all([
        getTopSoldProducts(selectedMonth, selectedMonth, 20),
        getTopPurchasedProducts(selectedMonth, selectedMonth, 20),
        getMonthlySalesAndPurchases(selectedMonth, selectedMonth),
        getTotalProducts(),
      ]);
      setTopSales(sales);
      setTopPurchases(purchases);
      setMonthlyTotals(monthly);
      setTotalProducts(totalProd.total);
     } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
    };

    fetchData();
  }, [selectedMonth]);

  // Para mostrar los totales del mes seleccionado (o cero)
  const latestMonthData = monthlyTotals.length > 0 ? monthlyTotals[0] : null; // solo trae un mes
  const latestTotalSales = latestMonthData?.totalSales ?? 0;
  const latestTotalPurchases = latestMonthData?.totalPurchases ?? 0;

  // Recorta nombres largos para las etiquetas del gráfico
  const formatProductName = (name: string) =>
    name.length > 15 ? name.slice(0, 15) + "…" : name;

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {loading && <p className="text-center text-gray-500">Cargando datos...</p>}

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Selector de Mes */}
        <div className="flex justify-end mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded p-2 dark:bg-gray-700 dark:text-white"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Título */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Bienvenido al Sistema de Inventario
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Visualiza métricas clave y controla el flujo de productos en tiempo
            real.
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Productos
              </p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalProducts}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ventas Mensuales
              </p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                $
                {latestTotalSales.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Compras Mensuales
              </p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                $
                {latestTotalPurchases.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico: Más Vendidos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Top 10 Productos Más Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSales}>
              <XAxis
                dataKey="productName"
                tickFormatter={formatProductName}
                tick={{ fontSize: 12, fill: "#6b7280" }} // gray-500
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalQuantity" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico: Más Comprados */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Top 10 Productos Más Comprados
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPurchases}>
              <XAxis
                dataKey="productName"
                tickFormatter={formatProductName}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalQuantity" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
