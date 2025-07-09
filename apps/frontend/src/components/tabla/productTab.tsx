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
    purchasePrice?: number,
    shelfId?: string,
    shelfName?: string
  ) => boolean;
  showPurchasePrice?: boolean;
  showSalePrice?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  localities: Locality[]; 
  hideLocality?: boolean;
  selectedLocality: string;
}

export function ProductsTab({
  products,
  onAdd,
  showPurchasePrice = false,
  showSalePrice = false,
  searchTerm,
  onSearchChange,  
  hideLocality = false,
  selectedLocality,
}: ProductsTableProps) {
  const [quantityMap, setQuantityMap] = useState<Record<string, number | string>>({});
  const [purchasePriceMap, setPurchasePriceMap] = useState<Record<string, number | string>>({});
  const [shelfMap, setShelfMap] = useState<Record<string, string>>({});

  const productDisplayList = products.map((product) => ({
    ...product,
    displayKey: `${product.id}-${product.unit_of_measure?.id}`,
    displayUnitName: product.unit_of_measure?.name ?? "N/A",
  }));

  const handleAdd = (product: ProductI, displayKey: string) => {
  const quantity = Number(quantityMap[displayKey]);
  const purchasePrice = Number(
    purchasePriceMap[displayKey] ?? product.purchase_price ?? 0
  );
  const shelfId = shelfMap[displayKey] || undefined;

  let shelfName: string | undefined = undefined;
  let localityId: string | undefined = undefined;

  if (!quantity || quantity <= 0) {
    addToast({ title: "Ingresa un valor de cantidad válido", color: "danger" });
    return;
  }

  if (!hideLocality) {
    localityId = selectedLocality;
    if (!localityId) {
      addToast({ title: "Selecciona una localidad", color: "danger" });
      return;
    }

    const filteredStocks = product.stocks?.filter(
      (s) => s.locality?.id === localityId
    );
    const shelves = filteredStocks?.map((s) => s.shelf).filter(Boolean);
    shelfName = shelves?.find((s) => s.id === shelfId)?.name;
  }

  const added = onAdd(
    product,
    localityId ?? "",
    quantity,
    purchasePrice,
    shelfId,
    shelfName
  );

  if (added) {
    setQuantityMap((prev) => ({ ...prev, [displayKey]: "" }));
    setPurchasePriceMap((prev) => ({ ...prev, [displayKey]: "" }));
    setShelfMap((prev) => ({ ...prev, [displayKey]: "" }));
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
        <div className="overflow-auto rounded border border-gray-300">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Unidad</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                {!hideLocality && <th className="px-4 py-2 text-left">Percha</th>}
                {(showPurchasePrice || showSalePrice) && (
                  <th className="px-4 py-2 text-left">Valor</th>
                )}
                <th className="px-4 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productDisplayList.map((product) => {
                const displayKey = product.displayKey;
                const filteredStocks = product.stocks?.filter(
                  (s) => s.locality?.id === selectedLocality
                );
                const shelves = filteredStocks?.map((s) => s.shelf).filter(Boolean);
                const stockByShelf = filteredStocks?.reduce((acc, curr) => {
                  if (curr.shelf?.id) {
                    acc[curr.shelf.id] = curr.quantity;
                  }
                  return acc;
                }, {} as Record<string, number>) ?? {};

                return (
                  <tr key={displayKey} className="border-b">
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.brand?.name || "N/A"}</td>
                    <td className="px-4 py-2">{product.displayUnitName}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min={0}
                        value={quantityMap[displayKey] ?? ""}
                        onChange={(e) =>
                          setQuantityMap((prev) => ({
                            ...prev,
                            [displayKey]: e.target.value,
                          }))
                        }
                        className="border rounded px-2 py-1 w-20"
                      />
                    </td>
                    {!hideLocality && (
                      <td className="px-4 py-2">
                        <select
                          value={shelfMap[displayKey] || ""}
                          onChange={(e) =>
                            setShelfMap((prev) => ({
                              ...prev,
                              [displayKey]: e.target.value,
                            }))
                          }
                          className="border rounded px-2 py-1 w-48"
                        >
                          <option value="">Selecciona percha</option>
                          {shelves?.map((shelf) => (
                            <option key={shelf.id} value={shelf.id}>
                              {shelf.name} ({stockByShelf[shelf.id] ?? 0})
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {showPurchasePrice && (
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={purchasePriceMap[displayKey] ?? ""}
                          onChange={(e) =>
                            setPurchasePriceMap((prev) => ({
                              ...prev,
                              [displayKey]: e.target.value,
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
                        onClick={() => handleAdd(product, displayKey)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
