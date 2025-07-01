"use client";

import React, { useState } from "react";
import { ProductI, UnitOfMeasure, Locality } from "@/types/product";
import { addToast } from "@heroui/toast";

interface ProductsTableProps {
  products: ProductI[];
  units: UnitOfMeasure[];
  onAdd: (
    product: ProductI,
    localityId: string,
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
  localities: Locality[];
  mode: "entrada" | "salida" | "venta" | "compra";
}

interface ProductWithDisplayKey extends ProductI {
  displayKey: string;
  displayUnitName: string;
}

export function ProductsTab({
  products,
  onAdd,
  showPurchasePrice = false,
  showSalePrice = false,
  searchTerm,
  onSearchChange,
  localities,
  mode,
}: ProductsTableProps) {
  const [quantityMap, setQuantityMap] = useState<Record<string, number | string>>({});
  const [purchasePriceMap, setPurchasePriceMap] = useState<Record<string, number | string>>({});
  const [localityMap, setLocalityMap] = useState<Record<string, string>>({});

  const productDisplayList: ProductWithDisplayKey[] = products.map((product) => ({
    ...product,
    displayKey: `${product.id}-${product.unit_of_measure?.id}`,
    displayUnitName: product.unit_of_measure?.name ?? "N/A",
  }));

  const handleAdd = (product: ProductWithDisplayKey, displayKey: string) => {
    const quantity = Number(quantityMap[displayKey]);
    const purchasePrice = Number(
      purchasePriceMap[displayKey] ?? product.purchase_price ?? 0
    );

    if (!quantity || quantity <= 0) {
      addToast({ title: "Ingresa un valor de cantidad válido", color: "danger" });
      return;
    }

    if (showPurchasePrice && (!purchasePrice || purchasePrice <= 0)) {
      addToast({ title: "Ingresa un valor de compra válido", color: "danger" });
      return;
    }

    let localityId: string | undefined;

    if (mode === "entrada") {
      localityId = localityMap[product.displayKey];
      if (!localityId) {
        addToast({ title: "Selecciona una localidad", color: "danger" });
        return;
      }
    } else {
      localityId = product.stocks?.[0]?.locality?.id;
      if (!localityId) {
        addToast({
          title: "No se encontró una localidad asignada",
          color: "danger",
        });
        return;
      }
    }

    const added = onAdd(product, localityId, quantity, purchasePrice);

    if (added) {
      setQuantityMap((prev) => ({ ...prev, [displayKey]: "" }));
      setPurchasePriceMap((prev) => ({ ...prev, [displayKey]: "" }));
      setLocalityMap((prev) => ({ ...prev, [displayKey]: "" }));
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

      {searchTerm.trim() === "" ? (
        <div className="text-center text-gray-500 py-8">
          Escribe para buscar productos...
        </div>
      ) : productDisplayList.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No se encontraron productos.
        </div>
      ) : (
        <table className="min-w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-left">Marca</th>
              <th className="px-4 py-2 text-left">Unidad</th>
              {mode === "entrada" && <th className="px-4 py-2 text-left">Localidad</th>}
              <th className="px-4 py-2 text-left">Cantidad</th>
              {showPurchasePrice && <th className="px-4 py-2 text-left">Valor de compra</th>}
              {showSalePrice && <th className="px-4 py-2 text-left">Valor de venta</th>}
              <th className="px-4 py-2 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {productDisplayList.map((product) => (
              <tr key={product.displayKey} className="border-b">
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.brand?.name || "N/A"}</td>
                <td className="px-4 py-2">{product.displayUnitName}</td>

                {mode === "entrada" ? (
                  <td className="px-4 py-2">
                    <select
                      value={localityMap[product.displayKey] || ""}
                      onChange={(e) =>
                        setLocalityMap((prev) => ({
                          ...prev,
                          [product.displayKey]: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-40"
                    >
                      <option value="">Selecciona localidad</option>
                      {localities.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </td>
                ) : (
                  <td className="px-4 py-2">
                    {product.stocks && product.stocks.length > 0
                      ? product.stocks.map((stock) => stock.locality?.name ?? "N/A").join(", ")
                      : "N/A"}
                  </td>
                )}

                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={1}
                    value={quantityMap[product.displayKey] ?? ""}
                    onFocus={() => {
                      if (quantityMap[product.displayKey] === 0) {
                        setQuantityMap((prev) => ({
                          ...prev,
                          [product.displayKey]: "",
                        }));
                      }
                    }}
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
                      onFocus={() => {
                        if (purchasePriceMap[product.displayKey] === 0) {
                          setPurchasePriceMap((prev) => ({
                            ...prev,
                            [product.displayKey]: "",
                          }));
                        }
                      }}
                      onChange={(e) =>
                        setPurchasePriceMap((prev) => ({
                          ...prev,
                          [product.displayKey]: Number(e.target.value) || 0,
                        }))
                      }
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
      )}
    </div>
  );
}
