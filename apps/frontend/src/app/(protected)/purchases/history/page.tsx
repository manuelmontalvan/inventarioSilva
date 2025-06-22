"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import { getProductCostHistory } from "@/lib/api/analytics";
import { getProducts } from "@/lib/api/products/products";
import { getCategories } from "@/lib/api/products/categories"; // Ajusta esta ruta a donde tengas tus funciones API
import { Combobox } from "@/components/ui/combobox";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
  };
};

type ProductCostData = {
  date: string;
  cost: number;
};

type ProductCostHistoryItem = {
  name: string;
  data: ProductCostData[];
};

type ViewBy = "day" | "month" | "year";

export default function ProductCostByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [costHistory, setCostHistory] = useState<ProductCostHistoryItem[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => dayjs().subtract(1, "year"));
  const [endDate, setEndDate] = useState(() => dayjs());
  const [viewBy, setViewBy] = useState<ViewBy>("month");

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (e) {
        setError("Error cargando categorías");
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      setSelectedProducts([]);
      return;
    }
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const allProducts = await getProducts();
        const filtered = allProducts.filter(
          (p) => p.category?.id === selectedCategory
        );
        setProducts(filtered);
        setSelectedProducts([]);
      } catch (e) {
        setError("Error cargando productos");
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProducts.length === 0) {
      setCostHistory([]);
      return;
    }
    async function loadCostHistory() {
      setLoadingHistory(true);
      try {
        const data = await getProductCostHistory({
          productIds: selectedProducts,
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        });
        setCostHistory(data);
      } catch (e) {
        setError("Error cargando historial de costos");
      } finally {
        setLoadingHistory(false);
      }
    }
    loadCostHistory();
  }, [selectedProducts, startDate, endDate]);

  // Agrupar por día, mes o año para el gráfico
  const groupedData = useMemo(() => {
    if (costHistory.length === 0) return null;

    // Formatear fechas según viewBy
    const formatDate = (dateStr: string) => {
      switch (viewBy) {
        case "day":
          return dayjs(dateStr).format("YYYY-MM-DD");
        case "month":
          return dayjs(dateStr).format("YYYY-MM");
        case "year":
          return dayjs(dateStr).format("YYYY");
        default:
          return dateStr;
      }
    };

    // Recolectar todas las fechas únicas en el rango, para el eje X
    const allDatesSet = new Set<string>();
    costHistory.forEach((product) =>
      product.data.forEach((point) => allDatesSet.add(formatDate(point.date)))
    );
    const allDates = Array.from(allDatesSet).sort();

    // Para cada producto, agrupar costos por fecha formateada y llenar fechas sin datos con null o 0
    const datasets = costHistory.map((product) => {
      const costByDate: Record<string, number> = {};
      product.data.forEach((point) => {
        const fDate = formatDate(point.date);
        costByDate[fDate] = point.cost;
      });

      // Valores ordenados según allDates, rellena 0 si no hay dato
      const data = allDates.map((date) => costByDate[date] ?? 0);

      return {
        label: product.name,
        data,
        fill: false,
        borderColor: getRandomColor(product.name),
        tension: 0.2,
      };
    });

    return { labels: allDates, datasets };
  }, [costHistory, viewBy]);

  function getRandomColor(seed: string) {
    // Color semi-aleatorio basado en texto para consistencia
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  }

  return (
    <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">
        Historial de costos por producto
      </h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <section className="mb-6 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex flex-col">
          <label htmlFor="category" className="font-semibold mb-1">
            Categoría
          </label>
          <Combobox
            items={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
            value={selectedCategory ?? ""}
            onChange={(val) => setSelectedCategory(val || null)}
            placeholder="Seleccione una categoría"
          />
        </div>

        <div className="flex flex-col flex-grow">
          <label className="font-semibold mb-1">Productos</label>
          {loadingProducts ? (
            <p className="text-gray-500 dark:text-gray-400">
              Cargando productos...
            </p>
          ) : products.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No hay productos</p>
          ) : (
            <MultiSelectCombobox
              items={products.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
              value={selectedProducts}
              onChange={setSelectedProducts}
              placeholder="Seleccionar productos"
            />
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="viewBy" className="font-semibold mb-1">
            Agrupar por
          </label>
          <select
            id="viewBy"
            value={viewBy}
            onChange={(e) => setViewBy(e.target.value as ViewBy)}
            className="input max-w-xs"
          >
            <option value="day">Día</option>
            <option value="month">Mes</option>
            <option value="year">Año</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="startDate" className="font-semibold mb-1">
            Fecha inicio
          </label>
          <input
            type="date"
            id="startDate"
            max={dayjs().format("YYYY-MM-DD")}
            value={startDate.format("YYYY-MM-DD")}
            onChange={(e) => setStartDate(dayjs(e.target.value))}
            className="input max-w-xs"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="endDate" className="font-semibold mb-1">
            Fecha fin
          </label>
          <input
            type="date"
            id="endDate"
            min={startDate.format("YYYY-MM-DD")}
            max={dayjs().format("YYYY-MM-DD")}
            value={endDate.format("YYYY-MM-DD")}
            onChange={(e) => setEndDate(dayjs(e.target.value))}
            className="input max-w-xs"
          />
        </div>
      </section>

      <section>
        {loadingHistory && <p>Cargando historial...</p>}
        {!loadingHistory && groupedData && groupedData.datasets.length > 0 && (
          <Line
            data={groupedData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { boxWidth: 12 },
                },
                title: {
                  display: true,
                  text: "Historial de costos por producto",
                },
                tooltip: {
                  mode: "nearest",
                  intersect: false,
                },
              },
              interaction: {
                mode: "nearest",
                intersect: false,
              },
              scales: {
                x: {
                  title: { display: true, text: "Fecha" },
                },
                y: {
                  title: { display: true, text: "Costo" },
                  beginAtZero: true,
                },
              },
            }}
          />
        )}
        {!loadingHistory &&
          (!groupedData || groupedData.datasets.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400">
              Seleccione uno o más productos para mostrar el gráfico.
            </p>
          )}
      </section>
    </main>
  );
}
