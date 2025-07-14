"use client";
import { MultiModelPredictionResponse } from "@/types/prediction";
import { getAllModelPredictions } from "@/lib/api/prediction/prediction";
import { useEffect, useState } from "react";
import {
  ProductForecastComparison,
} from "@/types/prediction";
import {
  searchPredictiveProducts,
  ProductSearchResult,
} from "@/lib/api/sales/productSales";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import SearchBar from "@/components/predictive/searchBar";
import ProductSelectors from "@/components/predictive/productSelector";
import SummaryCards from "@/components/predictive/summaryCards";
import SalesChart from "@/components/predictive/salesChart";
import { compareForecasts } from "@/lib/api/prediction/compare";
import SimpleModal from "@/components/predictive/Modal";
import ProductRestockTable from "@/components/predictive/productRestockTable";

export default function PredictiveAnalyticsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [multiModelPrediction, setMultiModelPrediction] = useState<MultiModelPredictionResponse | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [errorPrediction, setErrorPrediction] = useState<string | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [days, setDays] = useState(7);
  const [daysInput, setDaysInput] = useState(days.toString());
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockProducts, setRestockProducts] = useState<ProductForecastComparison[]>([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    searchPredictiveProducts("a")
      .then(setSearchResults)
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
      return;
    }
    if (days < 7 || days > 60) {
      setErrorPrediction("Ingresa un número de días entre 7 y 60");
      return;
    }
    setLoadingPrediction(true);
    setErrorPrediction(null);
    getAllModelPredictions(
      selectedProduct.product_name,
      selectedBrand,
      selectedUnit,
      days
    )
      .then(setMultiModelPrediction)
      .catch((e) => {
        const detail = e.response?.data?.detail;
        if (detail?.includes("no se encontró un modelo")) {
          setErrorPrediction("Este producto no tiene suficientes datos para generar una predicción.");
        } else {
          setErrorPrediction(detail || e.message || "Error desconocido al obtener la predicción");
        }
      })
      .finally(() => setLoadingPrediction(false));
  }, [selectedProduct, selectedBrand, selectedUnit, days]);

  const handleCompareLowStock = async () => {
    setLoadingCompare(true);
    try {
      const response = await compareForecasts("Sin marca", "Sin unidad", days);
      const low = response.comparison.filter((p) => p.total_forecast < 5);
      setRestockProducts(low);
      setRestockModalOpen(true);
    } catch (err) {
      console.error("Error comparando productos:", err);
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">Análisis Predictivo</h1>

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

        {errorPrediction && <p className="text-red-500 text-sm">{errorPrediction}</p>}

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

        <div className="flex items-center gap-4">
          <label className="text-sm">Días de predicción:</label>
          <input
            type="number"
            value={daysInput}
            onChange={(e) => {
              const val = e.target.value;
              setDaysInput(val);
              const parsed = parseInt(val);
              if (!isNaN(parsed) && parsed >= 7 && parsed <= 60) {
                setDays(parsed);
              }
            }}
            onBlur={() => {
              const parsed = parseInt(daysInput);
              if (isNaN(parsed) || parsed < 7 || parsed > 60) {
                alert("Ingresa un número de días entre 7 y 60");
                setDaysInput(days.toString());
              }
            }}
            className="p-2 rounded bg-gray-100"
          />
        </div>

        <button
          onClick={handleCompareLowStock}
          disabled={loadingCompare}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          {loadingCompare ? "Cargando..." : "Ver productos por renovar stock"}
        </button>

        {multiModelPrediction && (
          <>
            <SummaryCards
              loading={loadingPrediction}
              totalSales={Object.values(multiModelPrediction.forecasts).reduce(
                (acc, model) => acc + (model?.forecast?.reduce((a, f) => a + f.yhat, 0) || 0),
                0
              )}
              productName={multiModelPrediction.product}
              brand={multiModelPrediction.brand}
              unit={multiModelPrediction.unit}
              days={multiModelPrediction.days}
              tendency={""}
              alertRestock={false}
              multiModel={multiModelPrediction.forecasts}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(multiModelPrediction.forecasts).map(
                ([modelType, { forecast, metrics }]) => {
                  const chartData = forecast.map((point) => {
                    const date = new Date(point.ds);
                    const name = date.toLocaleDateString("es-ES", {
                      month: "short",
                      day: "2-digit",
                    });
                    return {
                      name: name.charAt(0).toUpperCase() + name.slice(1),
                      ventas: point.yhat,
                    };
                  });

                  return (
                    <div key={modelType} className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                      <h2 className="text-md font-semibold mb-2 capitalize">Modelo: {modelType}</h2>
                      {metrics && (
                        <p className="text-xs text-gray-500 mb-2">
                          MAE: {metrics.MAE.toFixed(2)} | RMSE: {metrics.RMSE.toFixed(2)}
                        </p>
                      )}
                      <SalesChart data={chartData} />
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}

        <SimpleModal
          isOpen={restockModalOpen}
          onClose={() => setRestockModalOpen(false)}
          title="Productos que necesitan renovación de stock"
        >
          <ProductRestockTable products={restockProducts} />
        </SimpleModal>
      </div>
    </ProtectedRoute>
  );
}
