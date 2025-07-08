"use client";

import { useEffect, useState } from "react";
import { getPrediction } from "@/lib/api/prediction/prediction";
import { PredictionResponse } from "@/types/prediction";
import {
  searchPredictiveProducts,
  ProductSearchResult,
} from "@/lib/api/sales/productSales";

import ProtectedRoute from "@/components/restricted/protectedRoute";
import SearchBar from "@/components/predictive/searchBar";
import ProductSelectors from "@/components/predictive/productSelector";
import DaysSelector from "@/components/predictive/daysSelector";
import SummaryCards from "@/components/predictive/summaryCards";
import SalesChart from "@/components/predictive/salesChart";

export default function PredictiveAnalyticsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSearchResult | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const [predictionData, setPredictionData] =
    useState<PredictionResponse | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [errorPrediction, setErrorPrediction] = useState<string | null>(null);

  const [days, setDays] = useState(7);
  const [tendency, setTendency] = useState<string>(""); // puedes setear por defecto "ascendente", "descendente", etc.
  const [alertRestock, setAlertRestock] = useState<boolean>(false);

  useEffect(() => {
    // Carga inicial con un query común para llenar el dropdown
    searchPredictiveProducts("a")
      .then((results) => {
        setSearchResults(results);
      })
      .catch(() => setSearchResults([]));
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      searchPredictiveProducts(searchTerm)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedBrand(selectedProduct.brands[0] || "");
      setSelectedUnit(selectedProduct.units[0] || "");
    } else {
      setSelectedBrand("");
      setSelectedUnit("");
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedProduct || !selectedBrand || !selectedUnit) {
      setPredictionData(null);
      return;
    }

    setLoadingPrediction(true);
    setErrorPrediction(null);

    getPrediction(
      selectedProduct.product_name,
      selectedBrand,
      selectedUnit,
      days,
      tendency,
      alertRestock
    )
      .then((data) => setPredictionData(data))
      .catch((e) =>
        setErrorPrediction(
          e.response?.data?.error || "Error al obtener las predicciones"
        )
      )
      .finally(() => setLoadingPrediction(false));
  }, [selectedProduct, selectedBrand, selectedUnit, days, tendency, alertRestock]);

  const chartData =
    predictionData?.forecast.map((p) => {
      const date = new Date(p.ds);
      const monthName = date.toLocaleString("es-ES", {
        month: "short",
        day: "2-digit",
      });
      return {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        ventas: p.yhat,
      };
    }) || [];

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Análisis Predictivo
        </h1>

        <SearchBar
          searchTerm={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setSelectedProduct(null);
          }}
          searchResults={searchResults}
          onSelect={(item) => {
            setSelectedProduct(item);
            setSearchTerm(item.product_name);
            setSearchResults([]);
          }}
        />

        {selectedProduct && (
          <ProductSelectors
            brands={selectedProduct.brands}
            units={selectedProduct.units}
            selectedBrand={selectedBrand}
            selectedUnit={selectedUnit}
            onBrandChange={setSelectedBrand}
            onUnitChange={setSelectedUnit}
          />
        )}

        <DaysSelector days={days} onChange={setDays} />

        {/* Aquí puedes agregar select o toggle para tendencia y alertRestock */}
        <div className="flex gap-4">
          <select
            value={tendency}
            onChange={(e) => setTendency(e.target.value)}
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded"
          >
            <option value="">Tendencia automática</option>
            <option value="ascendente">Ascendente</option>
            <option value="descendente">Descendente</option>
          </select>

          <label className="flex items-center gap-2 text-gray-700 dark:text-white">
            <input
              type="checkbox"
              checked={alertRestock}
              onChange={(e) => setAlertRestock(e.target.checked)}
            />
            Alerta por bajo stock
          </label>
        </div>

        {predictionData && (
          <SummaryCards
            loading={false}
            totalSales={predictionData.forecast.reduce((acc, f) => acc + f.yhat, 0)}
            productName={predictionData.product}
            brand={predictionData.brand}
            unit={predictionData.unit}
            days={predictionData.days}
            tendency={predictionData.tendency}
            alertRestock={predictionData.alert_restock}
            metrics={predictionData.metrics}
          />
        )}

      

        {loadingPrediction ? (
          <div>Cargando gráfico...</div>
        ) : errorPrediction ? (
          <div className="text-red-600">Error: {errorPrediction}</div>
        ) : (
          <SalesChart data={chartData} />
        )}
      </div>
    </ProtectedRoute>
  );
}
