"use client";

import React, { useState, useMemo } from "react";
import { ProductI, UnitOfMeasure } from "@/types/product";

interface ProductsTableProps {
  products: ProductI[];
  units: UnitOfMeasure[];
  onAdd: (product: ProductI, unitId: string, quantity: number) => void;
}

// Componente Combobox simple para seleccionar unidad (muestra nombre completo)
function ComboboxUnit({
  units,
  value,
  onChange,
}: {
  units: UnitOfMeasure[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Seleccionar</option>
      {units.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name} {/* Mostrar nombre completo */}
        </option>
      ))}
    </select>
  );
}

export function ProductsTab({ products, units, onAdd }: ProductsTableProps) {
  const [unitMap, setUnitMap] = useState<Record<string, string>>({});
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // Filtrar productos por nombre usando searchTerm (insensible a mayúsculas)
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Productos para la página actual
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAdd = (product: ProductI) => {
    const unitId = unitMap[product.id];
    const quantity = quantityMap[product.id];

    if (!unitId || !quantity || quantity <= 0) {
      alert("Debes seleccionar una unidad de medida y una cantidad válida");
      return;
    }

    onAdd(product, unitId, quantity);

    // Limpia campos
    setUnitMap((prev) => ({ ...prev, [product.id]: "" }));
    setQuantityMap((prev) => ({ ...prev, [product.id]: 0 }));
  };

  return (
    <div className="mt-6">
      {/* Input búsqueda */}
      <input
        type="text"
        placeholder="Buscar producto por nombre..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset pag al buscar
        }}
        className="mb-4 w-full px-3 py-2 border rounded text-sm dark:bg-gray-900 dark:text-white"
      />

      <div className="overflow-x-auto border rounded-lg border-gray-300 dark:border-gray-600">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Marca</th>
              <th className="px-4 py-2 text-left">Código</th>
              <th className="px-4 py-2 text-left">P. Venta</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Unidad</th>
              <th className="px-4 py-2 text-left">Cantidad</th>
              <th className="px-4 py-2 text-left">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No hay productos para mostrar.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.brand?.name || "N/A"}</td>
                  <td className="px-4 py-2">{product.internal_code || "N/A"}</td>
                  <td className="px-4 py-2">
                    ${Number(product.sale_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">{product.current_quantity}</td>
                  <td className="px-4 py-2">
                    <ComboboxUnit
                      units={units}
                      value={unitMap[product.id] || ""}
                      onChange={(val) =>
                        setUnitMap((prev) => ({ ...prev, [product.id]: val }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={1}
                      value={quantityMap[product.id] || ""}
                      onChange={(e) =>
                        setQuantityMap((prev) => ({
                          ...prev,
                          [product.id]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="border rounded px-2 py-1 w-20 text-sm"
                      placeholder="Cantidad"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={() => handleAdd(product)}
                    >
                      Agregar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            &lt; Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-black dark:bg-gray-800 dark:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
    </div>
  );
}
