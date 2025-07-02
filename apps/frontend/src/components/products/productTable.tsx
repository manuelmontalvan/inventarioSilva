"use client";

import { useEffect, useState } from "react";
import { ProductI } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
import { productColumnOptions } from "@/constants/productColumns";

interface ProductTableProps {
  products: ProductI[];
  onView: (product: ProductI) => void;
  onUpdated: (product: ProductI) => void;
  onDelete: (product: ProductI) => void;
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  visibleColumns: Record<string, boolean>;
}

type Named = { name: string };

export default function ProductTable({
  products,
  onView,
  onUpdated,
  onDelete,
  selectedProducts,
  setSelectedProducts,
  visibleColumns,
}: ProductTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductI;
    direction: "ascending" | "descending";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const requestSort = (key: keyof ProductI) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to page 1 on sort change
  };

  const getValue = (product: ProductI, key: keyof ProductI) => {
    const val = product[key];
    if (val === undefined || val === null) return "";

    if (typeof val === "object") {
      if ("name" in val) return (val as Named).name;
      return JSON.stringify(val);
    }

    if (key === "purchase_price" || key === "sale_price") {
      return `USD $${val}`;
    }

    if (key === "profit_margin") {
      const numberVal = Number(val);
      if (Number.isInteger(numberVal)) {
        return `${numberVal}%`;
      } else {
        return `${numberVal.toFixed(2).replace(/\.?0+$/, "")}%`;
      }
    }

    if (
      key === "entry_date" ||
      key === "last_updated" ||
      key === "expiration_date"
    ) {
      return new Date(val as string).toLocaleDateString();
    }

    if (typeof val === "boolean") {
      return val ? "Sí" : "No";
    }

    return val;
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    const valA = getValue(a, sortConfig.key);
    const valB = getValue(b, sortConfig.key);
    if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(checked ? products.map((p) => p.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((pid) => pid !== id)
    );
  };

  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  useEffect(() => {
    if (!sortConfig && products.length > 0) {
      setSortConfig({ key: "name", direction: "ascending" });
    }
  }, [products, sortConfig]);

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
      </div>

      <div className="min-w-[1200px]">
        <table className="w-full text-sm border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border hover:bg-gray-50">
                <Checkbox
                  checked={
                    selectedProducts.length === products.length &&
                    products.length > 0
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(Boolean(checked))
                  }
                />
              </th>
              {productColumnOptions.map(({ key, label }) => {
                if (!visibleColumns[key]) return null;
                return (
                  <th
                    key={key}
                    className="p-2 border cursor-pointer hover:bg-gray-200 hover:text-black select-none"
                    onClick={() => requestSort(key as keyof ProductI)}
                    scope="col"
                  >
                    {label}
                    {sortConfig?.key === key &&
                      (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                  </th>
                );
              })}
              <th className="p-2 border text-center hover:bg-gray-200 hover:text-black">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      Object.values(visibleColumns).filter(Boolean).length + 2
                    }
                    className="text-center py-8 text-gray-400"
                  >
                    No hay productos disponibles.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isQuantity = visibleColumns["current_quantity"];
                  const quantity = Number(p.current_quantity);
                  const minStock = Number(p.min_stock);
                  const maxStock = Number(p.max_stock);

                  let colorClass = "";

                  if (
                    isQuantity &&
                    !isNaN(quantity) &&
                    !isNaN(minStock) &&
                    !isNaN(maxStock)
                  ) {
                    if (quantity < minStock) {
                      colorClass = "text-red-500 font-semibold";
                    } else if (quantity > maxStock) {
                      colorClass = "text-green-600 font-semibold";
                    } else {
                      colorClass = "text-blue-600 font-semibold";
                    }
                  }

                  return (
                    <motion.tr
                      key={p.id}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={rowVariants}
                      className={`transition-colors duration-300 ${
                        selectedProducts.includes(p.id)
                          ? "bg-blue-50 text-black"
                          : ""
                      }`}
                      onClick={() => {
                        onView(p);
                      }}
                    >
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border hover:bg-gray-100"
                      >
                        <Checkbox
                          checked={selectedProducts.includes(p.id)}
                          onCheckedChange={(checked) =>
                            handleSelect(p.id, Boolean(checked))
                          }
                          aria-label={`Seleccionar producto ${p.name}`}
                        />
                      </td>

                      {productColumnOptions.map(({ key }) => {
                        if (!visibleColumns[key]) return null;

                        const isQty = key === "current_quantity";

                        let tdColorClass = "";

                        if (
                          isQty &&
                          !isNaN(quantity) &&
                          !isNaN(minStock) &&
                          !isNaN(maxStock)
                        ) {
                          if (quantity < minStock) {
                            tdColorClass = "text-red-500 font-semibold";
                          } else if (quantity > maxStock) {
                            tdColorClass = "text-green-600 font-semibold";
                          } else {
                            tdColorClass = "text-blue-600 font-semibold";
                          }
                        }

                        return (
                          <td
                            key={key}
                            className={`p-2 border hover:bg-gray-100 hover:text-black ${
                              key === "name"
                                ? "font-medium cursor-pointer"
                                : ""
                            } ${tdColorClass}`}
                          >
                            {isQty
                              ? quantity.toFixed(2)
                              : String(getValue(p, key as keyof ProductI))}
                          </td>
                        );
                      })}

                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border flex gap-2 justify-center"
                      >
                        <Button
                          color="success"
                          variant="bordered"
                          onPress={() => onUpdated(p)}
                          aria-label={`Editar producto ${p.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          color="danger"
                          variant="bordered"
                          onPress={() => onDelete(p)}
                          aria-label={`Eliminar producto ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
