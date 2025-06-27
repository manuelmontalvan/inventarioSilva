"use client";

import React, { useState } from "react";
import { ProductI, UnitOfMeasure } from "@/types/product";
import { addToast } from "@heroui/toast";

interface ProductsTableProps {
  products: ProductI[];
  units: UnitOfMeasure[];
  onAdd: (
    product: ProductI,
    unitId: string,
    quantity: number,
    purchasePrice?: number
  ) => boolean; 
  showPurchasePrice?: boolean;
  showSalePrice?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

export function ProductsTab({
  products,
  units,
  onAdd,
  showPurchasePrice = false,
  showSalePrice = false,
  currentPage,
  totalPages,
  onPageChange,
  searchTerm,
  onSearchChange,
}: ProductsTableProps) {
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const [purchasePriceMap, setPurchasePriceMap] = useState<
    Record<string, number>
  >({});

  // Agrupar productos por nombre + unidad para mostrar una fila por cada combinación
  const productDisplayList = products.map((product) => ({
    ...product,
    displayKey: `${product.id}-${product.unit_of_measure?.id}`,
    displayUnitName: product.unit_of_measure?.name ?? "N/A",
  }));

 const handleAdd = (product: ProductI, displayKey: string) => {
  const quantity = quantityMap[displayKey];
  const purchasePrice = purchasePriceMap[displayKey] ?? Number(product.purchase_price) ?? 0;

  if (!quantity || quantity <= 0) {
    addToast({ title: "Ingresa un valor de cantidad válido", color: "danger" });
    return;
  }

  if (showPurchasePrice && (!purchasePrice || purchasePrice <= 0)) {
    addToast({ title: "Ingresa un valor de compra válido", color: "danger" });
    return;
  }

  // Ahora guardamos si se agregó con éxito
  const added = onAdd(product, product.unit_of_measure.id, quantity, purchasePrice);

  // Solo reseteamos si realmente se agregó el producto
  if (added) {
    setQuantityMap((prev) => ({ ...prev, [displayKey]: 0 }));
    setPurchasePriceMap((prev) => ({ ...prev, [displayKey]: 0 }));
  }
};

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4 w-full px-3 py-2 border rounded"
      />

      <table className="min-w-full border border-gray-300 rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Producto</th>
            <th className="px-4 py-2 text-left">Marca</th>
            <th className="px-4 py-2 text-left">Unidad</th>
            <th className="px-4 py-2 text-left">Cantidad</th>
            {showPurchasePrice && (
              <th className="px-4 py-2 text-left">Valor de compra</th>
            )}
            {showSalePrice && (
              <th className="px-4 py-2 text-left">Valor de venta</th>
            )}
            <th className="px-4 py-2 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {productDisplayList.length === 0 && (
            <tr>
              <td
                colSpan={
                  5 + (showPurchasePrice ? 1 : 0) + (showSalePrice ? 1 : 0)
                }
                className="text-center py-4 text-gray-500"
              >
                No hay productos para mostrar.
              </td>
            </tr>
          )}
          {productDisplayList.map((product) => (
            <tr key={product.displayKey} className="border-b">
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2">{product.brand?.name || "N/A"}</td>
              <td className="px-4 py-2">{product.displayUnitName}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  min={1}
                  value={quantityMap[product.displayKey] || ""}
                  onChange={(e) =>
                    setQuantityMap((prev) => ({
                      ...prev,
                      [product.displayKey]: Number(e.target.value) || 0,
                    }))
                  }
                  className="border rounded px-2 py-1 w-20"
                />
              </td>
              {showPurchasePrice && (
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={
                      purchasePriceMap[product.displayKey] ??
                      Number(product.purchase_price) ??
                      ""
                    }
                    onChange={(e) =>
                      setPurchasePriceMap((prev) => ({
                        ...prev,
                        [product.displayKey]: Number(e.target.value) || 0,
                      }))
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        e.target.value = "";
                      }
                    }}
                    className="border rounded px-2 py-1 w-28"
                  />
                </td>
              )}
              {showSalePrice && (
                <td className="px-4 py-2">
                  {typeof product.sale_price === "number"
                    ? `$${product.sale_price.toFixed(2)}`
                    : "N/A"}
                </td>
              )}
              <td className="px-4 py-2">
                <button
                  onClick={() => handleAdd(product, product.displayKey)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Agregar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt; Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
    </div>
  );
}
