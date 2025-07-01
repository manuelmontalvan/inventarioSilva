"use client";

import { useEffect, useState } from "react";
import { getPrediction } from "@/lib/api/prediction/prediction";
import { getProducts } from "@/lib/api/products/products";
import {
  searchPredictiveProducts,
  ProductSearchResult,
} from "@/lib/api/sales/productSales";
import { ProductI } from "@/types/product";

import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { BarChart, LineChart, ArrowUpRight, Search } from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PredictionPoint {
  ds: string;
  yhat: number;
}

export default function PredictiveAnalyticsPage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSearchResult | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  
  // Ahora marcas y unidades vienen de dropdowns, por eso array y seleccionado
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [errorPrediction, setErrorPrediction] = useState<string | null>(null);

  const [days, setDays] = useState(7);

  // Cargar productos
  useEffect(() => {
    setLoadingProducts(true);
    getProducts({ limit: 1000 })
      .then((res) => {
        setProducts(res.data);
        if (res.data.length > 0) setSelectedProductId(res.data[0].id);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  // Buscar predictivamente en productSales por nombre
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.length < 2) return;
      searchPredictiveProducts(searchTerm)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Al seleccionar un producto, setear marcas y unidades disponibles
  useEffect(() => {
    if (selectedProduct) {
      // Si hay marcas y unidades, setea la primera como seleccionada para que dropdown tenga valor inicial
      setSelectedBrand(selectedProduct.brands[0] || "");
      setSelectedUnit(selectedProduct.units[0] || "");
    }
  }, [selectedProduct]);

  // Obtener predicción
  useEffect(() => {
    const productName =
      selectedProduct?.product_name ||
      products.find((p) => p.id === selectedProductId)?.name;

    if (!productName || !selectedBrand || !selectedUnit) return;

    setLoadingPrediction(true);
    setErrorPrediction(null);

    getPrediction(productName, selectedBrand, selectedUnit, days)
      .then(setPredictions)
      .catch((e) =>
        setErrorPrediction(
          e.response?.data?.error || "Error al obtener las predicciones"
        )
      )
      .finally(() => setLoadingPrediction(false));
  }, [selectedProduct, selectedProductId, selectedBrand, selectedUnit, days]);

  const chartData = predictions.map((p) => {
    const date = new Date(p.ds);
    const monthName = date.toLocaleString("es-ES", { month: "short" });
    return {
      name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      ventas: p.yhat,
    };
  });

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Análisis Predictivo
        </h1>

        {/* Búsqueda */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar producto por nombre (histórico de ventas)"
              className="w-full border rounded pl-10 pr-3 py-2"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedProduct(null);
              }}
            />
          </div>

          {searchResults.length > 0 && (
            <ul className="border rounded bg-white dark:bg-gray-800 max-h-40 overflow-auto z-10 relative">
              {searchResults.map((item, idx) => (
                <li
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(item);
                    setSearchTerm(item.product_name);
                    setSearchResults([]);
                  }}
                >
                  {item.product_name} — {item.brands.join(", ")} (
                  {item.units.join(", ")})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dropdown para seleccionar Marca */}
        {selectedProduct && (
          <div className="flex flex-col gap-2 max-w-xs">
            <label htmlFor="brand-select" className="font-medium text-gray-700 dark:text-gray-300">
              Selecciona Marca
            </label>
            <select
              id="brand-select"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {selectedProduct.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <label htmlFor="unit-select" className="font-medium text-gray-700 dark:text-gray-300 mt-4">
              Selecciona Unidad
            </label>
            <select
              id="unit-select"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {selectedProduct.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selector de días */}
        <div className="flex gap-4 items-center mt-6">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Días a predecir:
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded px-3 py-2 w-24"
          />
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-md">
            <CardContent className="flex flex-col gap-2 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Proyección de Ventas
                </span>
                <BarChart className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                {loadingPrediction
                  ? "Cargando..."
                  : `$${Math.round(
                      chartData.reduce((acc, d) => acc + d.ventas, 0)
                    )}`}
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
                <span className="text-sm font-medium text-gray-600">
                  Producto
                </span>
                <LineChart className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {selectedProduct?.product_name ||
                  products.find((p) => p.id === selectedProductId)?.name ||
                  ""}
              </p>
              <p className="text-sm text-gray-500">
                Proyección: {days} {days === 1 ? "día" : "días"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="flex flex-col gap-2 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Marca y Unidad
                </span>
                <LineChart className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-sm">
                {selectedBrand} / {selectedUnit}
              </p>
              <p className="text-xs text-gray-400">
                Basado en ventas históricas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Proyección de ventas (Próximos días)
          </h2>

          {loadingPrediction ? (
            <div>Cargando gráfico...</div>
          ) : errorPrediction ? (
            <div className="text-red-600">Error: {errorPrediction}</div>
          ) : (
            <>
              <div className="mb-4 font-semibold">
                {selectedProduct?.product_name} - {selectedBrand} (
                {selectedUnit})
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ReLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
