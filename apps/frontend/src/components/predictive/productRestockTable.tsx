import React from "react";
import { ProductForecastComparison } from "@/types/prediction";

interface Props {
  products: ProductForecastComparison[];
}

export default function ProductRestockTable({ products }: Props) {
  // Filtrar productos que tienen al menos un modelo con alerta de restock
  const filteredProducts = products.filter((p) =>
    Object.values(p.forecasts).some((model) => model.alert_restock)
  );

  if (filteredProducts.length === 0) {
    return <p className="text-gray-600 text-sm">No hay productos con alerta de stock.</p>;
  }

  return (
    <div className="overflow-auto rounded-md border border-gray-300">
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-3 py-2 border-b">Producto</th>
            <th className="px-3 py-2 border-b">Marca</th>
            <th className="px-3 py-2 border-b">Unidad</th>
            <th className="px-3 py-2 border-b text-right">Modelo</th>
            <th className="px-3 py-2 border-b text-right">Stock Actual</th>
            <th className="px-3 py-2 border-b text-right">Total Forecast</th>
            <th className="px-3 py-2 border-b text-right">Faltante</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) =>
            Object.entries(product.forecasts)
              .filter(([, forecast]) => forecast.alert_restock)
              .map(([modelName, forecast]) => (
                <tr key={`${product.product}-${product.brand}-${product.unit}-${modelName}`}>
                  <td className="px-3 py-1 border-t">{product.product}</td>
                  <td className="px-3 py-1 border-t">{product.brand}</td>
                  <td className="px-3 py-1 border-t">{product.unit}</td>
                  <td className="px-3 py-1 border-t text-right font-medium text-blue-600">{modelName}</td>
                  <td className="px-3 py-1 border-t text-right">{product.current_quality.toFixed(2)}</td>
                  <td className="px-3 py-1 border-t text-right">{forecast.total_forecast.toFixed(2)}</td>
                  <td className="px-3 py-1 border-t text-right text-red-600 font-semibold">
                    {forecast.needed_stock.toFixed(2)}
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  );
}
