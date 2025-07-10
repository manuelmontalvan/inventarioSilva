"use client";

import React, { useState } from "react";
import { PurchaseOrder } from "@/types/purchaseOrders";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExportDropdown from "@/components/ui/ExportDropdown";

interface Props {
  orders: PurchaseOrder[];
  products: { id: string; name: string }[];
}

// Define interface para extender jsPDF y tipar lastAutoTable
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const PurchaseOrderTable: React.FC<Props> = ({ orders, products }) => {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
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

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === paginatedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(paginatedOrders.map((order) => order.id));
    }
  };

  function handleExportPdf() {
    const doc: JsPDFWithAutoTable = new jsPDF();
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

    const finalY = doc.lastAutoTable?.finalY ?? 40;
    doc.text(`Total general: $${grandTotal.toFixed(2)}`, 14, finalY + 10);

    doc.save("ordenes_compra.pdf");
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

  function handleExportSingleOrderPdf(order: PurchaseOrder) {
    const doc: JsPDFWithAutoTable = new jsPDF();
    const tableColumn = [
      "Producto",
      "Marca",
      "Unidad",
      "Cantidad",
      "Costo Unitario",
      "Total",
    ];
    const tableRows: (string | number)[][] = [];

    const total = order.purchase_lines.reduce(
      (acc, item) => acc + Number(item.total_cost),
      0
    );

    order.purchase_lines.forEach((item) => {

      const name = item.product.name || "Producto sin nombre";
      const brandName = item.product.brand?.name || "N/A";
      const unitName = item.product.unit_of_measure?.name || "N/A";

      tableRows.push([
        name,
        brandName,
        unitName,
        item.quantity,
        `$${Number(item.unit_cost).toFixed(2)}`,
        `$${Number(item.total_cost).toFixed(2)}`,
      ]);
    });

    doc.text(`Orden de compra: ${order.orderNumber}`, 14, 15);
    doc.text(`Proveedor: ${order.supplier?.name || "N/A"}`, 14, 25);
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

    const finalY = doc.lastAutoTable?.finalY ?? 40;
    doc.text(`Total general: $${total.toFixed(2)}`, 14, finalY + 10);

    doc.save(`orden_${order.orderNumber}.pdf`);
  }

  function handleExportSingleOrderExcel(order: PurchaseOrder) {
    const worksheetData = order.purchase_lines.map((item) => {
      const name =
        products.find((p) => p.id === item.product.id)?.name || item.product.id;
      const brandName = item.product.brand?.name || "N/A";
      const unitName = item.product.unit_of_measure?.name || "N/A";

      return {
        Producto: name,
        Marca: brandName,
        Unidad: unitName,
        Cantidad: item.quantity,
        "Costo Unitario": Number(item.unit_cost).toFixed(2),
        Total: Number(item.total_cost).toFixed(2),
      };
    });

    const total = order.purchase_lines.reduce(
      (acc, item) => acc + Number(item.total_cost),
      0
    );
    const totalQuantity = order.purchase_lines.reduce(
      (acc, item) => acc + Number(item.quantity),
      0
    );
    worksheetData.push({
      Producto: "Total general",
      Marca: "",
      Unidad: "",
      Cantidad: totalQuantity,
      "Costo Unitario": "",
      Total: total.toFixed(2),
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
      skipHeader: false,
    });

    // Vaciar celda de Cantidad en la fila total para que se vea vacío en Excel
    const totalRowIndex = worksheetData.length; // índice base 0, hoja 1-based
    const cantidadCol = XLSX.utils.decode_col("D"); // columna D es Cantidad
    const cellAddress = XLSX.utils.encode_cell({
      r: totalRowIndex,
      c: cantidadCol,
    });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].v = "";
      worksheet[cellAddress].t = "s";
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Orden_${order.orderNumber}`
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `orden_${order.orderNumber}.xlsx`);
  }

  function handleExportSingleOrderCsv(order: PurchaseOrder) {
    const worksheetData = order.purchase_lines.map((item) => {
      const name =
        products.find((p) => p.id === item.product.id)?.name || item.product.id;
      const brandName = item.product.brand?.name || "N/A";
      const unitName = item.product.unit_of_measure?.name || "N/A";

      return {
        Producto: name,
        Marca: brandName,
        Unidad: unitName,
        Cantidad: item.quantity,
        "Costo Unitario": Number(item.unit_cost).toFixed(2),
        Total: Number(item.total_cost).toFixed(2),
      };
    });

    const total = order.purchase_lines.reduce(
      (acc, item) => acc + Number(item.total_cost),
      0
    );
    const totalQuantity = order.purchase_lines.reduce(
      (acc, item) => acc + Number(item.quantity),
      0
    );
    worksheetData.push({
      Producto: "Total general",
      Marca: "",
      Unidad: "",
      Cantidad: totalQuantity,
      "Costo Unitario": "",
      Total: total.toFixed(2),
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
      skipHeader: false,
    });
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `orden_${order.orderNumber}.csv`);
  }

  function handleExportSelectedPdf() {
    const doc: JsPDFWithAutoTable = new jsPDF();
    const title = "Reporte de órdenes seleccionadas";
    const tableColumn = ["Orden", "Proveedor", "Fecha", "Total"];
    const tableRows: (string | number)[][] = [];

    let grandTotal = 0;

    const selectedOrders = orders.filter((order) =>
      selectedOrderIds.includes(order.id)
    );

    selectedOrders.forEach((order) => {
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

    const finalY = doc.lastAutoTable?.finalY ?? 40;
    doc.text(`Total general: $${grandTotal.toFixed(2)}`, 14, finalY + 10);

    doc.save("ordenes_seleccionadas.pdf");
  }

  function handleExportSelectedExcel() {
    const selectedOrders = orders.filter((order) =>
      selectedOrderIds.includes(order.id)
    );

    const worksheetData = selectedOrders.map((order) => {
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes seleccionadas");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ordenes_seleccionadas.xlsx");
  }

  function handleExportSelectedCsv() {
    const selectedOrders = orders.filter((order) =>
      selectedOrderIds.includes(order.id)
    );

    const worksheetData = selectedOrders.map((order) => {
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
    saveAs(blob, "ordenes_seleccionadas.csv");
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4 sticky top-0 bg-white dark:bg-gray-900 z-30 p-2 rounded shadow-sm items-center">
        {/* Checkbox Seleccionar Todas */}
        <input
          type="checkbox"
          checked={
            paginatedOrders.length > 0 &&
            selectedOrderIds.length === paginatedOrders.length
          }
          onClick={(e) => e.stopPropagation()} // Evitar que se abra modal
          onChange={(e) => {
            e.stopPropagation();
            toggleSelectAll();
          }}
          className="mr-2 w-5 h-5 cursor-pointer"
          title="Seleccionar/Deseleccionar todas"
        />

        <input
          type="text"
          placeholder="Buscar por proveedor, factura u orden"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <ExportDropdown
          onExportAllPdf={handleExportPdf}
          onExportAllExcel={handleExportExcel}
          onExportAllCsv={handleExportCsv}
          onExportSelectedPdf={handleExportSelectedPdf}
          onExportSelectedExcel={handleExportSelectedExcel}
          onExportSelectedCsv={handleExportSelectedCsv}
          multipleSelected={selectedOrderIds.length > 0}
        />
      </div>

      {paginatedOrders.length === 0 ? (
        <p className="text-gray-500 italic">No hay órdenes registradas.</p>
      ) : (
        <div className="overflow-y-auto flex-1 space-y-4 max-h-[500px]">
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:shadow-md transition flex items-center ${
                selectedOrder?.id === order.id ? "ring-2 ring-indigo-600" : ""
              }`}
            >
              {/* Checkbox individual */}
              <input
                type="checkbox"
                checked={selectedOrderIds.includes(order.id)}
                onClick={(e) => e.stopPropagation()} // Evitar que se abra modal
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelectOrder(order.id);
                }}
                className="mr-4 w-5 h-5 cursor-pointer"
                title="Seleccionar orden"
              />

              <div className="flex justify-between items-center flex-grow">
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
                  <strong>Factura:</strong>{" "}
                  {selectedOrder.invoice_number || "N/A"}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedOrder.purchase_date).toLocaleDateString(
                    "es-EC",
                    { timeZone: "UTC" }
                  )}
                </p>
                <p>
                  <strong>Registrado por:</strong>{" "}
                  {selectedOrder.registeredBy?.name || "N/A"}
                </p>
                <p>
                  <strong>Notas:</strong> {selectedOrder.notes || "N/A"}
                </p>
              </div>

              {/* Tabla de productos */}
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 dark:border-gray-700 text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-2 border dark:border-gray-700 text-left">
                        Producto
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-left">
                        Marca
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-left">
                        Unidad
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-right">
                        Cantidad
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-right">
                        Costo Unitario
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.purchase_lines.map((line) => (
                      <tr
                        key={line.id}
                        className="border-b dark:border-gray-700"
                      >
                        <td className="p-2 border dark:border-gray-700">
                          {products.find((p) => p.id === line.product?.id)
                            ?.name ||
                            line.product?.name ||
                            "Producto no disponible"}
                        </td>
                        <td className="p-2 border dark:border-gray-700">
                          {line.product.brand?.name || "N/A"}
                        </td>
                        <td className="p-2 border dark:border-gray-700">
                          {line.product.unit_of_measure?.name || "N/A"}
                        </td>
                        <td className="p-2 border dark:border-gray-700 text-right">
                          {line.quantity}
                        </td>
                        <td className="p-2 border dark:border-gray-700 text-right">
                          ${Number(line.unit_cost).toFixed(2)}
                        </td>
                        <td className="p-2 border dark:border-gray-700 text-right">
                          ${Number(line.total_cost).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total general debajo de la tabla */}
              <div className="text-right font-semibold text-indigo-700 dark:text-indigo-400 mt-2 mr-2">
                Total general: $
                {selectedOrder.purchase_lines
                  .reduce((acc, line) => acc + Number(line.total_cost), 0)
                  .toFixed(2)}
              </div>

              {/* Botones de exportación */}
              <div className="flex gap-4 justify-end mt-4">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                  onClick={() => handleExportSingleOrderPdf(selectedOrder)}
                >
                  Exportar PDF
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  onClick={() => handleExportSingleOrderExcel(selectedOrder)}
                >
                  Exportar Excel
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  onClick={() => handleExportSingleOrderCsv(selectedOrder)}
                >
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderTable;
