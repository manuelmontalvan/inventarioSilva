"use client";

import { useState, useEffect, useRef } from "react";
import {
  getSoldProducts,
  getSaleHistory,
  getSalePriceTrend,
  getMonthlySalesTrend,
} from "@/lib/api/sales/productSales";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { SoldProduct, MergedSaleTrendItem } from "@/types/productSales";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@heroui/button";

function exportToExcel(data: any[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      Producto: item.productName || "-", // <-- Agregado
      Fecha: item.saleDate?.slice(0, 10),
      Cliente: item.customerName,
      Factura: item.invoiceNumber,
      Cantidad: item.quantity,
      "Precio Unitario": item.unitPrice,
      Total: item.totalPrice,
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
  XLSX.writeFile(workbook, "historial_ventas.xlsx");
}

function exportToPDF(data: any[]) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Historial de Ventas", 14, 16);

  autoTable(doc, {
    startY: 20,
    head: [
      [
        "Producto",
        "Fecha",
        "Cliente",
        "Factura",
        "Cantidad",
        "Precio Unitario",
        "Total",
      ], // <-- Agregado
    ],
    body: data.map((item) => [
      item.productName || "-", // <-- Agregado
      item.saleDate?.slice(0, 10),
      item.customerName || "-",
      item.invoiceNumber || "-",
      item.quantity,
      `$${Number(item.unitPrice).toFixed(2)}`,
      `$${Number(item.totalPrice).toFixed(2)}`,
    ]),
  });

  doc.save("historial_ventas.pdf");
}

function ProductAutocomplete({
  products,
  onSelect,
}: {
  products: SoldProduct[];
  onSelect: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = products.filter((p) => {
    const brand = p.brand?.name || "";
    const unit = p.unit_of_measure?.name || "";
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      brand.toLowerCase().includes(term) ||
      unit.toLowerCase().includes(term)
    );
  });

  const handleSelect = (p: SoldProduct) => {
    setSearchTerm(p.name);
    setShowDropdown(false);
    onSelect(p.id);
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
        onFocus={() => setShowDropdown(true)}
        className="w-full border rounded px-2 py-1"
      />
      {showDropdown && (
        <ul className="absolute bg-white z-10 border mt-1 rounded shadow w-full max-h-60 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <li
                key={p.id}
                onClick={() => handleSelect(p)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {p.name} — {p.brand?.name || "Sin marca"} —{" "}
                {p.unit_of_measure?.name || "Sin unidad"}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">
              No se encontraron productos
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
function mergeTrends(
  priceTrend: { month: string; unitPrice: number }[],
  salesTrend: { period: string; totalQuantity: number }[]
) {
  const mergedMap = new Map<string, any>();

  priceTrend.forEach((item) => {
    mergedMap.set(item.month, {
      period: item.month,
      unitPrice: item.unitPrice,
    });
  });

  salesTrend.forEach((item) => {
    const existing = mergedMap.get(item.period) || { period: item.period };
    existing.totalQuantity = item.totalQuantity;
    mergedMap.set(item.period, existing);
  });

  return Array.from(mergedMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
}
function getUniqueMonths(history: any[]): string[] {
  const months = new Set<string>();
  history.forEach((item) => {
    if (item.saleDate) {
      const month = item.saleDate.slice(0, 7); // yyyy-MM
      months.add(month);
    }
  });
  return Array.from(months).sort(); // Opcional: ordenar
}

export default function ProductSalesHistory() {
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState<SoldProduct[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mergedTrend, setMergedTrend] = useState<MergedSaleTrendItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // "" = todos
 

  const itemsPerPage = 10;
  useEffect(() => {
    getSoldProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      getSaleHistory(productId),
      getSalePriceTrend(productId),
      getMonthlySalesTrend(productId),
    ]).then(([h, t, s]) => {
      setHistory(h);
      setMergedTrend(mergeTrends(t, s));
      setCurrentPage(1);
    });
  }, [productId]);

 

  const filteredHistory = selectedMonth
    ? history.filter((item) => item.saleDate?.startsWith(selectedMonth))
    : history;
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="p-4 md:p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
        Historial de Ventas por Producto
      </h1>

      <ProductAutocomplete products={products} onSelect={setProductId} />

      {productId && (
        <>
          <Card className="overflow-x-auto">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Historial Detallado
              </h2>

              <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
                <div className="flex-1 flex justify-start">
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

                {/* Contenedor vacío para "espacio" */}
                <div className="flex-1"></div>

                {/* Contenedor para botón exportar centrado */}
                <div className="flex gap-4 justify-center">
                  <Button
                    onPress={() => exportToExcel(filteredHistory)}
                    variant="bordered"
                    color="success"
                  >
                    Exportar Excel
                  </Button>
                  <Button
                    onPress={() => exportToPDF(filteredHistory)}
                    variant="bordered"
                    color="warning"
                  >
                    Exportar PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm md:text-base">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b">
                    <tr>
                      <th className="p-2 text-left text-gray-800 dark:text-gray-200">
                        Fecha
                      </th>
                      <th className="p-2 text-left text-gray-800 dark:text-gray-200">
                        Cliente
                      </th>
                      <th className="p-2 text-left text-gray-800 dark:text-gray-200">
                        Factura
                      </th>
                      <th className="p-2 text-right text-gray-800 dark:text-gray-200">
                        Cantidad
                      </th>
                      <th className="p-2 text-right text-gray-800 dark:text-gray-200">
                        Precio Unitario
                      </th>
                      <th className="p-2 text-right text-gray-800 dark:text-gray-200">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((item, i) => (
                      <tr
                        key={i}
                        className="border-b even:bg-gray-50 dark:even:bg-gray-800"
                      >
                        <td className="p-2">{item.saleDate?.slice(0, 10)}</td>
                        <td className="p-2">{item.customerName || "-"}</td>
                        <td className="p-2">{item.invoiceNumber || "-"}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          ${Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="p-2 text-right">
                          ${Number(item.totalPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 border rounded transition-colors duration-200 ${
                      currentPage === index + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-black dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Tendencia de Precio y Ventas
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mergedTrend}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    stroke="#4B5563"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#4B5563"
                    tick={{ fill: "currentColor" }}
                  />
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
                    dataKey="unitPrice"
                    name="Precio Unitario"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalQuantity"
                    name="Cantidad Vendida"
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
