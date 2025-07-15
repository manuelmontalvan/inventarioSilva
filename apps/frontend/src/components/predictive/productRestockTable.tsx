import React from "react";
import { ProductForecastComparison } from "@/types/prediction";

interface Props {
  products: ProductForecastComparison[];
}

export default function ProductRestockTable({ products }: Props) {
  if (products.length === 0) {
    return <p>No hay productos con alerta de stock.</p>;
  }

  return (
    <table className="w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 px-3 py-1 text-left">Producto</th>
          <th className="border border-gray-300 px-3 py-1 text-left">Marca</th>
          <th className="border border-gray-300 px-3 py-1 text-left">Unidad</th>
          <th className="border border-gray-300 px-3 py-1 text-right">Stock Actual</th>
          <th className="border border-gray-300 px-3 py-1 text-right">Cantidad Necesaria</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={`${p.product}-${p.brand}-${p.unit}`}>
            <td className="border border-gray-300 px-3 py-1">{p.product}</td>
            <td className="border border-gray-300 px-3 py-1">{p.brand}</td>
            <td className="border border-gray-300 px-3 py-1">{p.unit}</td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {p.current_quality?.toFixed(2) ?? "0.00"}
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {p.needed_stock?.toFixed(2) ?? "0.00"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
