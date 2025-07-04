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

  // Cargar productos iniciales para mostrar opciones desde product_sales
  useEffect(() => {
  // Carga inicial con un query común para llenar el dropdown
  searchPredictiveProducts("a")
    .then((results) => {
      setSearchResults(results);
      // No seleccionamos producto por defecto aquí
    })
    .catch(() => setSearchResults([]));
}, []);


  // Buscar productos cuando cambia searchTerm
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

  // Actualizar brand y unit cuando cambia selectedProduct
  useEffect(() => {
    if (selectedProduct) {
      setSelectedBrand(selectedProduct.brands[0] || "");
      setSelectedUnit(selectedProduct.units[0] || "");
    } else {
      setSelectedBrand("");
      setSelectedUnit("");
    }
  }, [selectedProduct]);

  // Obtener predicción cuando cambian los datos
  useEffect(() => {
    if (
      !selectedProduct ||
      !selectedBrand ||
      !selectedUnit
    ) {
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
    )
      .then((data) => setPredictionData(data))
      .catch((e) =>
        setErrorPrediction(
          e.response?.data?.error || "Error al obtener las predicciones",
        ),
      )
      .finally(() => setLoadingPrediction(false));
  }, [selectedProduct, selectedBrand, selectedUnit, days]);

  // Formatear datos para el gráfico
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

        <SummaryCards
          loading={loadingPrediction}
          totalSales={chartData.reduce((acc, d) => acc + d.ventas, 0)}
          productName={selectedProduct?.product_name || ""}
          days={days}
          brand={selectedBrand}
          unit={selectedUnit}
        />

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
