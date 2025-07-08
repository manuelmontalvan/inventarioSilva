// src/components/predictive/productRestockTable.tsx
"use client";

import { ProductForecastComparison } from "@/types/prediction";

interface Props {
  products: ProductForecastComparison[];
}

export default function ProductRestockTable({ products }: Props) {
  if (products.length === 0) {
    return <p className="text-gray-600 dark:text-gray-300">No hay productos por renovar stock.</p>;
  }

  return (
    <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700">
      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white">
        <tr>
          <th className="p-2 text-left">Producto</th>
          <th className="p-2 text-left">Marca</th>
          <th className="p-2 text-left">Unidad</th>
          <th className="p-2 text-left">Ventas estimadas</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p, index) => (
          <tr
            key={`${p.product}-${index}`}
            className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td className="p-2">{p.product}</td>
            <td className="p-2">{p.brand}</td>
            <td className="p-2">{p.unit}</td>
            <td className="p-2 text-right">{p.total_forecast.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
