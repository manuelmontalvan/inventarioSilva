"use client";

import { useState } from "react";
import { InventoryMovement } from "@/types/inventory";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Props {
  movements: InventoryMovement[];
}

export default function InventoryTable({ movements }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovements = movements.filter((m) => {
    const search = searchTerm.toLowerCase();
    const typeText = m.type === "IN" ? "entrada" : "salida";
    return (
      m.productName?.toLowerCase().includes(search) ||
      m.brandName?.toLowerCase().includes(search) ||
      m.locality?.name?.toLowerCase().includes(search) ||
      m.shelfName?.toLowerCase().includes(search) ||
      m.invoice_number?.toLowerCase().includes(search) ||
      m.orderNumber?.toLowerCase().includes(search) ||
      typeText.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginated = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
const exportToPDF = () => {
  const doc = new jsPDF({ orientation: "landscape" }); // Mejor orientación para muchas columnas
  const title = "Movimientos de Inventario";
  const date = new Date().toLocaleString("es-EC");

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generado: ${date}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [[
      "Fecha",
      "Tipo",
      "Producto",
      "Marca",
      "Unidad",
      "Cantidad",
      "Localidad",
      "Percha",
      "Orden",
      "Factura",
      "Notas"
    ]],
    body: filteredMovements.map((m) => [
      new Date(m.createdAt).toLocaleString("es-EC", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }),
      m.type === "IN" ? "Entrada" : "Salida",
      m.productName || m.product?.name || "-",
      m.brandName || "-",
      m.unitName || "-",
      m.quantity,
      m.locality?.name || "-",
      m.shelfName || m.shelfId || "-",
      m.orderNumber || "-",
      m.invoice_number || "-",
      m.notes || "-",
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 102, 204], // Azul
      textColor: 255,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 20 },
      2: { cellWidth: 38 },
      3: { cellWidth: 30 },
      4: { cellWidth: 22 },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 28 },
      7: { cellWidth: 24 },
      8: { cellWidth: 26 },
      9: { cellWidth: 26 },
      10: { cellWidth: 26 },
    },
    margin: { top: 28, left: 14, right: 14 },
  });

  doc.save("movimientos_inventario.pdf");
};

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredMovements.map((m) => ({
        Fecha: new Date(m.createdAt).toLocaleString("es-EC", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "UTC",
        }),
        Tipo: m.type === "IN" ? "Entrada" : "Salida",
        Producto: m.productName || m.product?.name || "-",
        Marca: m.brandName || "-",
        Unidad: m.unitName || "-",
        Cantidad: m.quantity,
        Localidad: m.locality?.name || "-",
        Percha: m.shelfName || m.shelfId || "-",
        Orden: m.orderNumber || "-",
        Factura: m.invoice_number || "-",
        Notas: m.notes || "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "movimientos_inventario.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar por producto, tipo o orden..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reiniciar a página 1 al buscar
          }}
          className="w-full sm:max-w-md px-4 py-2 border rounded-md text-sm
               bg-white text-gray-900 border-gray-300
               dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />

        {/* Botones de exportación */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={exportToPDF}
            disabled={filteredMovements.length === 0}
            className="px-4 py-2 text-sm rounded font-medium
                 bg-red-600 text-white hover:bg-red-700
                 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Exportar PDF
          </button>
          <button
            onClick={exportToExcel}
            disabled={filteredMovements.length === 0}
            className="px-4 py-2 text-sm rounded font-medium
                 bg-green-600 text-white hover:bg-green-700
                 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-100">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Unidad</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Localidad</th>
              <th className="px-4 py-2">Percha</th>
              <th className="px-4 py-2">Orden</th>
              <th className="px-4 py-2">Factura</th>
              <th className="px-4 py-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((m) => (
              <tr
                key={m.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2">
                  {new Date(m.createdAt).toLocaleString("es-EC", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "UTC",
                  })}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      m.type === "IN"
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                        : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                    }`}
                  >
                    {m.type === "IN" ? "Entrada" : "Salida"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {m.productName || m.product?.name || "-"}
                </td>
                <td className="px-4 py-2">{m.brandName || "-"}</td>
                <td className="px-4 py-2">{m.unitName || "-"}</td>
                <td className="px-4 py-2">{m.quantity}</td>
                <td className="px-4 py-2">{m.locality?.name || "-"}</td>
                <td className="px-4 py-2">{m.shelfName || m.shelfId || "-"}</td>
                <td className="px-4 py-2">{m.orderNumber || "-"}</td>
                <td className="px-4 py-2">{m.invoice_number || "-"}</td>
                <td className="px-4 py-2">{m.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-end items-center gap-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
