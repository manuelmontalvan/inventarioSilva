"use client";

import { useState, useEffect } from "react";
import {
  getPurchaseHistory,
  getPurchasePriceTrend,
  getPurchasedProducts,
  getMonthlyPurchaseQuantityTrend,
} from "@/lib/api/purchases/purchaseOrders";
import { Button } from "@heroui/button";
import { ProductI } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function exportToExcel(data: any[], productName: string) {
  const sheetName = productName || "Historial Compras";
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      Fecha: item.purchaseDate?.slice(0, 10) ?? "-",
      Proveedor: item.supplierName ?? "-",
      Factura: item.invoiceNumber ?? "-",
      Cantidad: item.quantity ?? 0,
      "Costo Unitario":
        typeof item.unitCost === "number"
          ? item.unitCost.toFixed(2)
          : item.unitCost ?? "-",
      Total:
        typeof item.totalCost === "number"
          ? item.totalCost.toFixed(2)
          : item.totalCost ?? "-",
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `historial_compras_${sheetName.replace(/\s+/g, "_")}.xlsx`);
}

function exportToPDF(data: any[], productName: string) {
  const doc = new jsPDF();

  if (productName) {
    doc.setFontSize(12);
    doc.text(productName, 14, 14);
  }

  doc.setFontSize(14);
  doc.text("Historial de Compras", 14, productName ? 22 : 16);

  autoTable(doc, {
    startY: productName ? 26 : 20,
    head: [["Fecha", "Proveedor", "Factura", "Cantidad", "Costo Unitario", "Total"]],
    body: data.map((item) => [
      item.purchaseDate?.slice(0, 10) ?? "-",
      item.supplierName ?? "-",
      item.invoiceNumber ?? "-",
      item.quantity ?? 0,
      typeof item.unitCost === "number"
        ? `$${item.unitCost.toFixed(2)}`
        : item.unitCost ?? "-",
      typeof item.totalCost === "number"
        ? `$${item.totalCost.toFixed(2)}`
        : item.totalCost ?? "-",
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  const safeName = productName?.replace(/\s+/g, "_") || "historial_compras";
  doc.save(`${safeName}.pdf`);
}

function ProductAutocomplete({
  products,
  onSelect,
}: {
  products: ProductI[];
  onSelect: (id: string, name: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredProducts = products.filter((product) => {
    const brandName = product.brand?.name ?? "";
    const unitName = product.unit_of_measure?.name ?? "";
    const search = searchTerm.toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      brandName.toLowerCase().includes(search) ||
      unitName.toLowerCase().includes(search)
    );
  });

  const handleSelect = (product: ProductI) => {
    setSearchTerm(product.name);
    setShowDropdown(false);
    onSelect(product.id, product.name); // <-- enviamos id y nombre
  };

  return (
    <div className="relative w-[300px]">
      <input
        type="text"
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        autoComplete="off"
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && filteredProducts.length > 0 && (
        <ul className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded mt-1 max-h-60 overflow-auto w-full shadow-lg">
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              onClick={() => handleSelect(product)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              {product.name} — {product.brand?.name ?? "Sin marca"} —{" "}
              {product.unit_of_measure?.name ?? "Sin unidad"}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && filteredProducts.length === 0 && (
        <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded mt-1 px-3 py-2 w-full text-gray-500 dark:text-gray-400">
          No se encontraron productos
        </div>
      )}
    </div>
  );
}

function getUniqueMonths(history: any[]): string[] {
  const months = new Set<string>();
  history.forEach((item) => {
    if (item.purchaseDate) {
      const month = item.purchaseDate.slice(0, 7);
      months.add(month);
    }
  });
  return Array.from(months).sort();
}

function mergeTrends(
  priceTrend: { month: string; unitCost: number }[],
  quantityTrend: { period: string; totalQuantity: number }[]
) {
  const map = new Map<string, any>();

  priceTrend.forEach((item) => {
    map.set(item.month, {
      period: item.month,
      unitCost: item.unitCost,
    });
  });

  quantityTrend.forEach((item) => {
    const existing = map.get(item.period) || { period: item.period };
    existing.totalQuantity = item.totalQuantity;
    map.set(item.period, existing);
  });

  return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export default function PurchaseHistoryPage() {
  const [productId, setProductId] = useState<string>("");
  const [productName, setProductName] = useState<string>(""); // nuevo
  const [products, setProducts] = useState<ProductI[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [mergedTrend, setMergedTrend] = useState<any[]>([]);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getPurchasedProducts();
      setProducts(products);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      const [historyData, priceTrendData, quantityTrendData] = await Promise.all([
        getPurchaseHistory({ productId }),
        getPurchasePriceTrend(productId),
        getMonthlyPurchaseQuantityTrend(productId),
      ]);
      setHistory(historyData);
      setMergedTrend(mergeTrends(priceTrendData, quantityTrendData));
      setCurrentPage(1);
    };

    fetchData();
  }, [productId]);

  const filteredHistory = selectedMonth
    ? history.filter((item) => item.purchaseDate?.startsWith(selectedMonth))
    : history;

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
        Historial de Compras por Producto
      </h1>

      <ProductAutocomplete
        products={products}
        onSelect={(id, name) => {
          setProductId(id);
          setProductName(name);
        }}
      />

      {productId && (
        <>
          <Card className="overflow-x-auto">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Historial Detallado
              </h2>

              <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
                <div className="flex-1 flex justify-start items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                    Filtrar por mes:
                  </label>
                  <select
                    className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">Todos</option>
                    {getUniqueMonths(history).map((month: string) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1" />

                <div className="flex gap-4 justify-center">
                  <Button
                    onPress={() => exportToExcel(filteredHistory, productName)}
                    variant="bordered"
                    color="success"
                  >
                    Exportar Excel
                  </Button>
                  <Button
                    onPress={() => exportToPDF(filteredHistory, productName)}
                    variant="bordered"
                    color="warning"
                  >
                    Exportar PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm md:text-base">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300">
                    <tr>
                      <th className="p-2 text-left border-r border-gray-300 text-gray-800 dark:text-gray-200">
                        Fecha
                      </th>
                      <th className="p-2 text-left border-r border-gray-300 text-gray-800 dark:text-gray-200">
                        Proveedor
                      </th>
                      <th className="p-2 text-left border-r border-gray-300 text-gray-800 dark:text-gray-200">
                        Factura
                      </th>
                      <th className="p-2 text-right border-r border-gray-300 text-gray-800 dark:text-gray-200">
                        Cantidad
                      </th>
                      <th className="p-2 text-right border-r border-gray-300 text-gray-800 dark:text-gray-200">
                        Costo Unitario
                      </th>
                      <th className="p-2 text-right border-gray-300 text-gray-800 dark:text-gray-200">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((item, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-300 even:bg-gray-50 dark:even:bg-gray-800"
                      >
                        <td className="p-2 text-left">{item.purchaseDate?.slice(0, 10)}</td>
                        <td className="p-2 text-left">{item.supplierName}</td>
                        <td className="p-2 text-left">{item.invoiceNumber}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          {typeof item.unitCost === "number"
                            ? `$${item.unitCost.toFixed(2)}`
                            : item.unitCost}
                        </td>
                        <td className="p-2 text-right">
                          {typeof item.totalCost === "number"
                            ? `$${item.totalCost.toFixed(2)}`
                            : item.totalCost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                  <Button
                    key={index + 1}
                    onPress={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 border rounded transition-colors duration-200 ${
                      currentPage === index + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-black dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Tendencia de Compras (Costo Unitario y Cantidad)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mergedTrend}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke="#4B5563" tick={{ fill: "currentColor" }} />
                  <YAxis yAxisId="left" stroke="#4B5563" tick={{ fill: "currentColor" }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#4B5563"
                    tick={{ fill: "currentColor" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderRadius: "4px",
                      borderColor: "#374151",
                    }}
                    itemStyle={{ color: "#f9fafb" }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="unitCost"
                    name="Costo Unitario"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalQuantity"
                    name="Cantidad Comprada"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
