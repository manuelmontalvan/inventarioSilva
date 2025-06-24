"use client";

import React, { useState } from "react";
import { SaleI } from "@/types/productSales";
import { ProductI } from "@/types/product";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  sales: SaleI[];
  products: ProductI[];
  loading?: boolean;
}

export const SalesTable: React.FC<Props> = ({ sales, products, loading }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<SaleI | null>(null);
  const itemsPerPage = 5;

  if (loading) {
    return <p className="text-center py-4">Cargando ventas...</p>;
  }

  const filteredSales = sales.filter((sale) => {
    const customerName = sale.customer?.name?.toLowerCase() || "";
    const status = sale.status?.toLowerCase() || "";
    const orderNumber = sale.orderNumber?.toLowerCase() || "";
    const query = search.toLowerCase();

    return (
      customerName.includes(query) ||
      status.includes(query) ||
      sale.id.toLowerCase().includes(query) ||
      orderNumber.includes(query)
    );
  });

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  // Export report completo
  function handleExportPdf() {
    const doc = new jsPDF();
    const title = "Reporte de ventas";
    const tableColumn = ["Orden", "Cliente", "Fecha", "Total", "Estado", "Vendedor"];
    const tableRows: (string | number)[][] = [];
    let grandTotal = 0;

    sales.forEach((sale) => {
      const totalAmount = Number(sale.total_amount);
      grandTotal += totalAmount;

      const row = [
        sale.orderNumber || sale.id,
        sale.customer?.name || "N/A",
        new Date(sale.sale_date).toLocaleDateString(),
        `$${totalAmount.toFixed(2)}`,
        sale.status,
        sale.soldBy?.name + " " + sale.soldBy?.lastname || "N/A",
      ];
      tableRows.push(row);
    });

    doc.text(title, 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
    });

    doc.text(
      `Total general: $${grandTotal.toFixed(2)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );

    doc.save("ventas.pdf");
  }

  // Export Excel completo
  function handleExportExcel() {
    const data = sales.map((sale) => ({
      Orden: sale.orderNumber || sale.id,
      Cliente: sale.customer?.name || "N/A",
      Fecha: new Date(sale.sale_date).toLocaleDateString(),
      Total: Number(sale.total_amount).toFixed(2),
      Estado: sale.status,
      Vendedor: sale.soldBy?.name + " " + sale.soldBy?.lastname || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "ventas.xlsx");
  }

  // Export CSV completo
  function handleExportCsv() {
    const data = sales.map((sale) => ({
      Orden: sale.orderNumber || sale.id,
      Cliente: sale.customer?.name || "N/A",
      Fecha: new Date(sale.sale_date).toLocaleDateString(),
      Total: Number(sale.total_amount).toFixed(2),
      Estado: sale.status,
      Vendedor: sale.soldBy?.name + " " + sale.soldBy?.lastname || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "ventas.csv");
  }

  // Export PDF individual
  function handleExportSinglePdf(sale: SaleI) {
    const doc = new jsPDF();
    const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Total"];
    const tableRows: (string | number)[][] = [];

    const totalAmount = Number(sale.total_amount);

    sale.productSales.forEach((item) => {
      const productName =
        products.find((p) => p.id === item.productId)?.name || item.productId;

      const row = [
        productName,
        item.quantity,
        `$${Number(item.unit_price).toFixed(2)}`,
        `$${Number(item.total_price).toFixed(2)}`,
      ];
      tableRows.push(row);
    });

    doc.text(`Venta Orden: ${sale.orderNumber || sale.id}`, 14, 15);
    doc.text(`Cliente: ${sale.customer?.name || "N/A"}`, 14, 25);
    doc.text(`Fecha: ${new Date(sale.sale_date).toLocaleDateString()}`, 14, 35);
    doc.text(`Estado: ${sale.status}`, 14, 45);
    doc.text(
      `Vendedor: ${sale.soldBy?.name || ""} ${sale.soldBy?.lastname || ""}`,
      14,
      55
    );

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
    });

    doc.text(
      `Total: $${totalAmount.toFixed(2)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );

    doc.save(`venta_${sale.orderNumber || sale.id}.pdf`);
  }

  return (
    <div className="flex flex-col">
      {/* Buscador y botones de exportación global */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente, estado, orden o ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        />
        <button onClick={handleExportPdf} className="btn">
          PDF
        </button>
        <button onClick={handleExportExcel} className="btn">
          Excel
        </button>
        <button onClick={handleExportCsv} className="btn">
          CSV
        </button>
      </div>

      {/* Lista paginada de ventas */}
      {paginatedSales.length === 0 ? (
        <p className="text-gray-500 italic">No hay ventas registradas.</p>
      ) : (
        <div className="space-y-4">
          {paginatedSales.map((sale) => (
            <div
              key={sale.id}
              onClick={() => setSelectedSale(sale)}
              className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                    Orden: {sale.orderNumber || sale.id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Cliente: <strong>{sale.customer?.name || "N/A"}</strong>
                  </p>
                </div>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(sale.sale_date).toLocaleDateString("es-EC", {
                    timeZone: "UTC",
                  })}
                </time>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm dark:text-white">
                <p>
                  <strong>Total:</strong> ${Number(sale.total_amount).toFixed(2)}
                </p>
                <p>
                  <strong>Estado:</strong> {sale.status}
                </p>
                <p>
                  <strong>Vendedor:</strong> {sale.soldBy?.name || "N/A"}{" "}
                  {sale.soldBy?.lastname || ""}
                </p>
                <p>
                  <strong>Pago:</strong> {sale.payment_method}
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === index + 1
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-black dark:bg-gray-800 dark:text-white"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal para venta seleccionada */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
            {/* Header con botones de exportación individual */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                Venta Orden: {selectedSale.orderNumber || selectedSale.id}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportSinglePdf(selectedSale)}
                  className="text-sm px-3 py-1 rounded bg-red-600 text-white"
                >
                  PDF
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-500 hover:text-red-600 text-xl"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 space-y-4 text-sm dark:text-white grid grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Cliente:</strong> {selectedSale.customer?.name || "N/A"}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedSale.sale_date).toLocaleDateString("es-EC", {
                    timeZone: "UTC",
                  })}
                </p>
                <p>
                  <strong>Estado:</strong> {selectedSale.status}
                </p>
                <p>
                  <strong>Método de pago:</strong> {selectedSale.payment_method}
                </p>
              </div>
              <div>
                <p>
                  <strong>Vendedor:</strong>{" "}
                  {selectedSale.soldBy?.name || ""} {selectedSale.soldBy?.lastname || ""}
                </p>
                <p>
                  <strong>Notas:</strong> {selectedSale.notes || "N/A"}
                </p>
                <p>
                  <strong>Total:</strong> ${Number(selectedSale.total_amount).toFixed(2)}
                </p>
              </div>

              {/* Tabla de productos vendidos */}
              <div className="col-span-2 overflow-x-auto">
                <table className="w-full border border-gray-300 dark:border-gray-700 text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-2 border dark:border-gray-700 text-left">
                        Producto
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-right">
                        Cantidad
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-right">
                        Precio Unitario
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedSale.productSales]
                      .sort((a, b) => {
                        const nameA =
                          products.find((p) => p.id === a.productId)?.name || "";
                        const nameB =
                          products.find((p) => p.id === b.productId)?.name || "";
                        return nameA.localeCompare(nameB);
                      })
                      .map((item) => {
                        const productName =
                          products.find((p) => p.id === item.productId)?.name ||
                          item.productId;
                        return (
                          <tr key={item.id} className="border-t dark:border-gray-700">
                            <td className="p-2 border dark:border-gray-700">
                              {productName}
                            </td>
                            <td className="p-2 border dark:border-gray-700 text-right">
                              {item.quantity}
                            </td>
                            <td className="p-2 border dark:border-gray-700 text-right">
                              ${Number(item.unit_price).toFixed(2)}
                            </td>
                            <td className="p-2 border dark:border-gray-700 text-right font-semibold">
                              ${Number(item.total_price).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                      <td
                        colSpan={3}
                        className="p-2 text-right border dark:border-gray-700"
                      >
                        Total general
                      </td>
                      <td className="p-2 text-right border dark:border-gray-700">
                        ${Number(selectedSale.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
