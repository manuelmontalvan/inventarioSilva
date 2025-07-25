"use client";

import React, { useState } from "react";
import { SaleI } from "@/types/productSales";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmModal from "@/components/confirmModal";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { ProductI } from "@/types/product";
interface Props {
  sales: SaleI[];
  loading?: boolean;
  products: ProductI[];
  onDeleteSales?: (ids: string[]) => Promise<void>;
  onDeleteAllSales?: () => Promise<void>;
}
type DeleteMode = "selected" | "all";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const SalesTable: React.FC<Props> = ({
  sales: salesProp,
  loading,
  onDeleteSales,
  onDeleteAllSales,
  products,
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<SaleI | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>("selected");
  const itemsPerPage = 5;
  const [sales, setSales] = useState<SaleI[]>(salesProp);
  const statusMap: Record<string, string> = {
    paid: "Pagado",
    pending: "Pendiente",
    cancelled: "Cancelado",
  };

  const paymentMethodMap: Record<string, string> = {
    cash: "Efectivo",
    credit: "Crédito",
    transfer: "Transferencia",
  };

  // Estado local para manejar ventas y actualizar tras eliminar


  React.useEffect(() => {
    setSales(salesProp);
  }, [salesProp]);

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

  // Maneja checkbox individual
  const toggleSelectSale = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Maneja checkbox "seleccionar todo en la página"
  const toggleSelectAllCurrentPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      paginatedSales.forEach((sale) =>
        checked ? updated.add(sale.id) : updated.delete(sale.id)
      );
      return updated;
    });
  };

  // Al confirmar eliminar
  const confirmDelete = async () => {
    try {
      if (deleteMode === "selected") {
        if (onDeleteSales) {
          const idsToDelete = Array.from(selectedIds);
          await onDeleteSales(idsToDelete);
          setSales((prev) => prev.filter((sale) => !selectedIds.has(sale.id)));
          setSelectedIds(new Set());
          addToast({
            title: "Éxito",
            description: `Se eliminaron ${idsToDelete.length} ventas.`,
            color: "success",
          });
        }
      } else if (deleteMode === "all") {
        if (onDeleteAllSales) {
          await onDeleteAllSales();
          setSales([]);
          setSelectedIds(new Set());
          addToast({
            title: "Éxito",
            description: `Historial de ventas vaciado correctamente.`,
            color: "success",
          });
        }
      }
      setConfirmOpen(false);
      setCurrentPage(1);
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo completar la operación.",
        color: "danger",
      });
      setConfirmOpen(false);
    }
  };

  const handleDeleteSelected = () => {
    setDeleteMode("selected");
    setConfirmOpen(true);
  };

  const handleDeleteAll = () => {
    setDeleteMode("all");
    setConfirmOpen(true);
  };
  // Export PDF (igual que antes)
  function handleExportPdf() {
    const doc: JsPDFWithAutoTable = new jsPDF();
    const title = "Reporte de ventas";
    const tableColumn = [
      "Orden",
      "Cliente",
      "Fecha",
      "Total",
      "Estado",
      "Vendedor",
    ];
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

    const finalY = doc.lastAutoTable?.finalY ?? 40;
    doc.text(`Total general: $${grandTotal.toFixed(2)}`, 14, finalY + 10);

    doc.save("ventas.pdf");
  }

  // Export Excel
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
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "ventas.xlsx");
  }

  // Export CSV
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

  // Export single sale PDF (igual que antes)
  function handleExportSinglePdf(sale: SaleI) {
    const doc: JsPDFWithAutoTable = new jsPDF();
    const tableColumn = [
      "Producto",
      "Marca",
      "Unidad",
      "Cantidad",
      "Precio Unitario",
      "Total",
    ];
    const tableRows: (string | number)[][] = [];

    const totalAmount = Number(sale.total_amount);

    sale.productSales.forEach((item) => {
      const row = [
        item.product?.name || "N/A",
        item.product?.brand?.name || "N/A",
        item.product?.unit_of_measure?.name || "N/A",
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

    const finalY = doc.lastAutoTable?.finalY ?? 40;
    doc.text(`Total: $${totalAmount.toFixed(2)}`, 14, finalY + 10);

    doc.save(`venta_${sale.orderNumber || sale.id}.pdf`);
  }

  return (
    <div className="flex flex-col">
      {/* Buscador y botones */}
      <div className="flex gap-2 mb-4 items-center">
        <input
          type="checkbox"
          className="w-4 h-4"
          onChange={(e) => toggleSelectAllCurrentPage(e.target.checked)}
          checked={
            paginatedSales.length > 0 &&
            paginatedSales.every((s) => selectedIds.has(s.id))
          }
        />
        <label className="select-none text-sm dark:text-white mr-2">
          Seleccionar todo página
        </label>

        <input
          type="text"
          placeholder="Buscar por cliente, estado, orden o ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        />
        <Button onPress={handleExportPdf} color="success" variant="bordered">
          PDF
        </Button>
        <Button onPress={handleExportExcel} color="success" variant="bordered">
          Excel
        </Button>
        <Button onPress={handleExportCsv} color="success" variant="bordered">
          CSV
        </Button>

        {selectedIds.size > 0 && (
          <Button
            onPress={handleDeleteSelected}
            color="danger"
            variant="bordered"
          >
            Eliminar seleccionadas ({selectedIds.size})
          </Button>
        )}
        {sales.length > 0 && (
          <Button
            onPress={handleDeleteAll}
            color="danger"
            variant="solid"
          >
            Vaciar historial
          </Button>
        )}
      </div>

      {/* Lista de ventas */}
      {paginatedSales.length === 0 ? (
        <p className="text-gray-500 italic">No hay ventas registradas.</p>
      ) : (
        <div className="space-y-4">
          {paginatedSales.map((sale) => (
            <div
              key={sale.id}
              className={`border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm transition cursor-pointer hover:shadow-md
              ${selectedIds.has(sale.id) ? "border-indigo-500" : ""}`}
              onClick={() => setSelectedSale(sale)}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(sale.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectSale(sale.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4"
                  />
                  <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                    Orden: {sale.orderNumber || sale.id}
                  </h3>
                </div>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(sale.sale_date).toLocaleDateString("es-EC", {
                    timeZone: "UTC",
                  })}
                </time>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm dark:text-white">
                <p>
                  <strong>Total:</strong> $
                  {Number(sale.total_amount).toFixed(2)}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  {statusMap[sale.status] || sale.status}
                </p>
                <p>
                  <strong>Vendedor:</strong> {sale.soldBy?.name || "N/A"}{" "}
                  {sale.soldBy?.lastname || ""}
                </p>
                <p>
                  <strong>Pago:</strong>{" "}
                  {paymentMethodMap[sale.payment_method] || sale.payment_method}
                </p>
              </div>
            </div>
          ))}

          {/* Paginación */}
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

      {/* Modal detalle */}
      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50 p-4"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Aquí tu modal detalle (igual que tu código original) */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                Venta Orden: {selectedSale.orderNumber || selectedSale.id}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleExportSinglePdf(selectedSale);
                  }}
                  className="text-sm px-3 py-1 rounded bg-red-600 text-white"
                >
                  PDF
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-500 hover:text-red-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 text-sm dark:text-white grid grid-cols-2 gap-4">
              {/* Detalle cliente, fecha, estado, etc */}
              {/* ... Igual que tu código original ... */}
              <div>
                <p>
                  <strong>Cliente:</strong>{" "}
                  {selectedSale.customer?.name || "N/A"}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedSale.sale_date).toLocaleDateString(
                    "es-EC",
                    {
                      timeZone: "UTC",
                    }
                  )}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  {statusMap[selectedSale.status] || selectedSale.status}
                </p>
                <p>
                  <strong>Método de pago:</strong>{" "}
                  {paymentMethodMap[selectedSale.payment_method] ||
                    selectedSale.payment_method}
                </p>
              </div>
              <div>
                <p>
                  <strong>Vendedor:</strong> {selectedSale.soldBy?.name || ""}{" "}
                  {selectedSale.soldBy?.lastname || ""}
                </p>
                <p>
                  <strong>Notas:</strong> {selectedSale.notes || "N/A"}
                </p>
                <p>
                  <strong>Total:</strong> $
                  {Number(selectedSale.total_amount).toFixed(2)}
                </p>
              </div>

              {/* Tabla productos vendidos */}
              <div className="col-span-2 overflow-x-auto">
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
                        const nameA = a.product?.name || "";
                        const nameB = b.product?.name || "";
                        return nameA.localeCompare(nameB);
                      })
                      .map((item) => {
                        const fallbackProduct = products.find(
                          (p) => p.id === item.productId
                        ); // ← usamos el prop products

                        return (
                          <tr
                            key={item.id}
                            className="border-t dark:border-gray-700"
                          >
                            <td className="p-2 border dark:border-gray-700">
                              {item.product?.name ||
                                fallbackProduct?.name ||
                                item.productId}
                            </td>
                            <td className="p-2 border dark:border-gray-700">
                              {item.product?.brand?.name ||
                                fallbackProduct?.brand?.name ||
                                "N/A"}
                            </td>
                            <td className="p-2 border dark:border-gray-700">
                              {item.product?.unit_of_measure?.name ||
                                fallbackProduct?.unit_of_measure?.name ||
                                "N/A"}
                            </td>
                            <td className="p-2 border dark:border-gray-700 text-right">
                              {Number(item.quantity).toFixed(2)}
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
                        colSpan={5}
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

      {/* Modal Confirmación para eliminar */}
       <ConfirmModal
        isOpen={confirmOpen}
        title={
          deleteMode === "all"
            ? "Vaciar historial"
            : "Eliminar ventas seleccionadas"
        }
        message={
          deleteMode === "all"
            ? "¿Seguro que deseas eliminar todas las ventas?"
            : `¿Seguro que deseas eliminar las ${selectedIds.size} ventas seleccionadas?`
        }
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
