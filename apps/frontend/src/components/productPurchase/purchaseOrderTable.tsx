"use client";

import React, { useState } from "react";
import { PurchaseOrder } from "@/types/purchaseOrders";

interface Props {
  orders: PurchaseOrder[];
  products: { id: string; name: string }[];
}

export const PurchaseOrderTable: React.FC<Props> = ({ orders, products }) => {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );

  const filteredOrders = orders.filter((order) => {
    const supplierName = order.supplier?.name?.toLowerCase() || "";
    const invoice = order.invoice_number?.toLowerCase() || "";
    const query = search.toLowerCase();

    return supplierName.includes(query) || invoice.includes(query);
  });

  return (
    <div className="flex flex-col h-full">
      <input
        type="text"
        placeholder="Buscar por proveedor o factura"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sticky top-0 bg-white dark:bg-gray-900 z-20"
      />

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 italic">No hay órdenes registradas.</p>
      ) : (
        <div className="overflow-y-auto flex-1 space-y-4 max-h-[500px]">
          {filteredOrders.map((order) => (
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
                  {new Date(order.purchase_date).toLocaleDateString()}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                Nº Orden de compra :  {selectedOrder.orderNumber}
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
                  {new Date(selectedOrder.purchase_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Registrado por:</strong>{" "}
                  {selectedOrder.registeredBy?.name || "N/A"}
                </p>
                <p>
                  <strong>Notas:</strong> {selectedOrder.notes || "N/A"}
                </p>
              </div>

              <div className="overflow-x-auto">
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
                        Costo Unitario
                      </th>
                      <th className="p-2 border dark:border-gray-700 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedOrder.purchase_lines]
                      .sort((a, b) => {
                        const nameA =
                          products.find((p) => p.id === a.product.id)?.name ||
                          "";
                        const nameB =
                          products.find((p) => p.id === b.product.id)?.name ||
                          "";
                        return nameA.localeCompare(nameB);
                      })
                      .map((item) => {
                        const productName =
                          products.find((p) => p.id === item.product.id)
                            ?.name || item.product.id;
                        return (
                          <tr
                            key={item.product.id}
                            className="border-t dark:border-gray-700"
                          >
                            <td className="p-2 border dark:border-gray-700">
                              {productName}
                            </td>
                            <td className="p-2 border dark:border-gray-700 text-right">
                              {item.quantity}
                            </td>
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
                      <td
                        colSpan={3}
                        className="p-2 border text-right dark:border-gray-700"
                      >
                        Total general
                      </td>
                      <td className="p-2 border text-right dark:border-gray-700">
                        $
                        {selectedOrder.purchase_lines
                          .reduce(
                            (acc, item) => acc + Number(item.total_cost),
                            0
                          )
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
