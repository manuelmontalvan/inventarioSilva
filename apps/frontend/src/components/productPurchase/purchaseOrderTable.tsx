// src/components/productPurchase/purchaseOrderTable.tsx
"use client";

import React, { useState } from "react";
import { PurchaseOrder } from "@/types/purchaseOrders";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Props {
  orders: PurchaseOrder[];
  products: { id: string; name: string }[];
}

export const PurchaseOrderTable: React.FC<Props> = ({ orders, products }) => {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredOrders = orders.filter((order) => {
    const supplierName = order.supplier?.name?.toLowerCase() || "";
    const invoice = order.invoice_number?.toLowerCase() || "";
    const orderNumber = order.orderNumber?.toLowerCase() || "";
    const query = search.toLowerCase();

    return (
      supplierName.includes(query) ||
      invoice.includes(query) ||
      orderNumber.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function handleExportPdf() {
    const doc = new jsPDF();
    const title = "Reporte de órdenes de compra";
    const tableColumn = ["Orden", "Proveedor", "Fecha", "Total"];
    const tableRows: (string | number)[][] = [];

    let grandTotal = 0;

    orders.forEach((order) => {
      const totalOrder = order.purchase_lines.reduce(
        (acc, item) => acc + Number(item.total_cost),
        0
      );
      grandTotal += totalOrder;
      tableRows.push([
        order.orderNumber,
        order.supplier?.name || "N/A",
        new Date(order.purchase_date).toLocaleDateString(),
        `$${totalOrder.toFixed(2)}`,
      ]);
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

    doc.save("ordenes_compra.pdf");
  }

  function handleExportSingleOrderPdf(order: PurchaseOrder) {
    const doc = new jsPDF();
    const tableColumn = ["Producto", "Cantidad", "Costo Unitario", "Total"];
    const tableRows: (string | number)[][] = [];

    const total = order.purchase_lines.reduce(
      (acc, item) => acc + Number(item.total_cost),
      0
    );

    order.purchase_lines.forEach((item) => {
      const name =
        products.find((p) => p.id === item.product.id)?.name || item.product.id;
      tableRows.push([
        name,
        item.quantity,
        `$${Number(item.unit_cost).toFixed(2)}`,
        `$${Number(item.total_cost).toFixed(2)}`,
      ]);
    });

    doc.text(`Orden de compra: ${order.orderNumber}`, 14, 15);
    doc.text(`Proveedor: ${order.supplier?.name}`, 14, 25);
    doc.text(
      `Fecha: ${new Date(order.purchase_date).toLocaleDateString()}`,
      14,
      35
    );

    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
    });

    doc.text(
      `Total: $${total.toFixed(2)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );

    doc.save(`orden_${order.orderNumber}.pdf`);
  }

  function handleExportExcel() {
    const worksheetData = orders.map((order) => {
      const total = order.purchase_lines.reduce(
        (acc, item) => acc + Number(item.total_cost),
        0
      );
      return {
        Orden: order.orderNumber,
        Proveedor: order.supplier?.name || "N/A",
        Fecha: new Date(order.purchase_date).toLocaleDateString("es-EC"),
        Total: total.toFixed(2),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ordenes_compra.xlsx");
  }

  function handleExportCsv() {
    const worksheetData = orders.map((order) => {
      const total = order.purchase_lines.reduce(
        (acc, item) => acc + Number(item.total_cost),
        0
      );
      return {
        Orden: order.orderNumber,
        Proveedor: order.supplier?.name || "N/A",
        Fecha: new Date(order.purchase_date).toLocaleDateString("es-EC"),
        Total: total.toFixed(2),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "ordenes_compra.csv");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4 sticky top-0 bg-white dark:bg-gray-900 z-30 p-2 rounded shadow-sm">
        <input
          type="text"
          placeholder="Buscar por proveedor, factura u orden"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleExportPdf}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded"
        >
          PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
        >
          Excel
        </button>
        <button
          onClick={handleExportCsv}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 rounded"
        >
          CSV
        </button>
        <button
          onClick={() => selectedOrder && handleExportSingleOrderPdf(selectedOrder)}
          disabled={!selectedOrder}
          className={`px-4 rounded text-white ${
            selectedOrder ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Exportar orden abierta
        </button>
      </div>

      {paginatedOrders.length === 0 ? (
        <p className="text-gray-500 italic">No hay órdenes registradas.</p>
      ) : (
        <div className="overflow-y-auto flex-1 space-y-4 max-h-[500px]">
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                    Orden: {order.orderNumber || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Proveedor: <strong>{order.supplier?.name || "N/A"}</strong>
                  </p>
                </div>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.purchase_date).toLocaleDateString("es-EC", {
                    timeZone: "UTC",
                  })}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded border ${
              page === currentPage
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                Nº Orden de compra : {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm dark:text-white">
              <div className="grid gap-1">
                <p>
                  <strong>Proveedor:</strong> {selectedOrder.supplier?.name}
                </p>
                <p>
                  <strong>Factura:</strong> {selectedOrder.invoice_number}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedOrder.purchase_date).toLocaleDateString("es-EC", {
                    timeZone: "UTC",
                  })}
                </p>
                <p>
                  <strong>Registrado por:</strong> {selectedOrder.registeredBy?.name || "N/A"}
                </p>
                <p>
                  <strong>Notas:</strong> {selectedOrder.notes || "N/A"}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 dark:border-gray-700 text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-2 border dark:border-gray-700 text-left">Producto</th>
                      <th className="p-2 border dark:border-gray-700 text-right">Cantidad</th>
                      <th className="p-2 border dark:border-gray-700 text-right">Costo Unitario</th>
                      <th className="p-2 border dark:border-gray-700 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedOrder.purchase_lines]
                      .sort((a, b) => {
                        const nameA =
                          products.find((p) => p.id === a.product.id)?.name || "";
                        const nameB =
                          products.find((p) => p.id === b.product.id)?.name || "";
                        return nameA.localeCompare(nameB);
                      })
                      .map((item) => {
                        const productName =
                          products.find((p) => p.id === item.product.id)?.name || item.product.id;
                        return (
                          <tr key={item.product.id} className="border-t dark:border-gray-700">
                            <td className="p-2 border dark:border-gray-700">{productName}</td>
                            <td className="p-2 border dark:border-gray-700 text-right">{item.quantity}</td>
                            <td className="p-2 border dark:border-gray-700 text-right">
                              ${Number(item.unit_cost).toFixed(2)}
                            </td>
                            <td className="p-2 border dark:border-gray-700 text-right font-semibold">
                              ${Number(item.total_cost).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    <tr className="bg-gray-100 dark:bg-gray-800 font-bold">
                      <td colSpan={3} className="p-2 border text-right dark:border-gray-700">
                        Total general
                      </td>
                      <td className="p-2 border text-right dark:border-gray-700">
                        $
                        {selectedOrder.purchase_lines
                          .reduce((acc, item) => acc + Number(item.total_cost), 0)
                          .toFixed(2)}
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
