"use client";

import { useEffect, useState } from "react";
import { ProductI } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
import { productColumnOptions } from "@/constants/productColumns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    setCurrentPage(1);
  };

  const getValue = (product: ProductI, key: keyof ProductI) => {
    const val = product[key];
    if (val === undefined || val === null) return "";

    if (typeof val === "object") {
      if ("name" in val) return (val as Named).name;
      return JSON.stringify(val);
    }

    if (key === "purchase_price" || key === "sale_price") {
      const numberVal = Number(val);
      return `USD $${numberVal.toFixed(2)}`;
    }

    if (key === "profit_margin") {
      const numberVal = Number(val);
      return Number.isInteger(numberVal)
        ? `${numberVal}%`
        : `${numberVal.toFixed(2).replace(/\.?0+$/, "")}%`;
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
    return valA < valB ? -1 : valA > valB ? 1 : 0;
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

const exportToExcel = () => {
  const exportData = sortedProducts.map((p) => {
    const row: Record<string, any> = {};
    productColumnOptions.forEach(({ key, label }) => {
      if (visibleColumns[key]) {
        row[label] = getValue(p, key as keyof ProductI);
      }
    });
    row["Stock"] = (p.stocks || [])
      .map(
        (s) =>
          `${s.locality?.name || "Sin Localidad"} - ${
            s.shelf?.name || "Sin Percha"
          }: ${Number(s.quantity).toFixed(2)}`
      )
      .join(" | ");
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
  XLSX.writeFile(workbook, "productos.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  const tableColumn: string[] = [];
  const tableRows: any[] = [];

  productColumnOptions.forEach(({ key, label }) => {
    if (visibleColumns[key]) tableColumn.push(label);
  });
  tableColumn.push("Stock");

  sortedProducts.forEach((p) => {
    const row: any[] = [];
    productColumnOptions.forEach(({ key }) => {
      if (visibleColumns[key]) {
        row.push(getValue(p, key as keyof ProductI));
      }
    });
    row.push(
      (p.stocks || [])
        .map(
          (s) =>
            `${s.locality?.name || "Sin Localidad"} - ${
              s.shelf?.name || "Sin Percha"
            }: ${Number(s.quantity).toFixed(2)}`
        )
        .join(" | ")
    );
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8 },
  });

  doc.save("productos.pdf");
};

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
        <div className="flex gap-2">
          <Button color="primary" variant="solid" onPress={exportToExcel}>
            Exportar Excel
          </Button>
          <Button color="secondary" variant="solid" onPress={exportToPDF}>
            Exportar PDF
          </Button>
        </div>
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
                    className="p-2 border cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => requestSort(key as keyof ProductI)}
                  >
                    {label}
                    {sortConfig?.key === key &&
                      (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                  </th>
                );
              })}
              <th className="p-2 border">Stock</th>
              <th className="p-2 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      Object.values(visibleColumns).filter(Boolean).length + 3
                    }
                    className="text-center py-8 text-gray-400"
                  >
                    No hay productos disponibles.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const quantity = Number(p.current_quantity || 0);

                  const minStock = Number(p.min_stock);
                  const maxStock = Number(p.max_stock);

                  const stockDetail = (p.stocks || [])
                    .map(
                      (s) =>
                        `${s.locality?.name || "Sin Localidad"} - ${
                          s.shelf?.name || "Sin Percha"
                        }: ${Number(s.quantity).toFixed(2)}`
                    )
                    .join("\n");

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
                      onClick={() => onView(p)}
                    >
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border"
                      >
                        <Checkbox
                          checked={selectedProducts.includes(p.id)}
                          onCheckedChange={(checked) =>
                            handleSelect(p.id, Boolean(checked))
                          }
                        />
                      </td>

                      {productColumnOptions.map(({ key }) => {
                        if (!visibleColumns[key]) return null;

                        const isQty = key === "current_quantity";
                        let tdColor = "";

                        if (
                          isQty &&
                          !isNaN(quantity) &&
                          !isNaN(minStock) &&
                          !isNaN(maxStock)
                        ) {
                          tdColor =
                            quantity < minStock
                              ? "text-red-500 font-semibold"
                              : quantity > maxStock
                              ? "text-green-600 font-semibold"
                              : "text-blue-600 font-semibold";
                        }

                        return (
                          <td
                            key={key}
                            className={`p-2 border ${
                              key === "name" ? "font-medium cursor-pointer" : ""
                            } ${tdColor}`}
                          >
                            {isQty
                              ? quantity.toFixed(2)
                              : String(getValue(p, key as keyof ProductI))}
                          </td>
                        );
                      })}

                      <td className="p-2 border whitespace-pre-wrap text-white">
                        {stockDetail || ""}
                      </td>

                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border flex gap-2 justify-center"
                      >
                        <Button
                          color="success"
                          variant="bordered"
                          onPress={() => onUpdated(p)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          color="danger"
                          variant="bordered"
                          onPress={() => onDelete(p)}
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
