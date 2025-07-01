"use client";

import React, { useEffect, useState } from "react";
import { ProductI, Locality } from "@/types/product";
import { getProducts } from "@/lib/api/products/products";
import { ProductsTab } from "@/components/tabla/productTab";
import { addToast } from "@heroui/toast";
import { getLocalities } from "@/lib/api/products/localities";
interface InventoryFormProps {
  onSubmit: (data: {
    type: "IN" | "OUT";
    movements: {
      productId: string;
      quantity: number;
      unitId: string;
      productName: string;
      brandName: string;
      unitName: string;
    }[];
    invoice_number?: string;
    orderNumber?: string;
    notes?: string;
  }) => Promise<void>;
}

export default function InventoryForm({ onSubmit }: InventoryFormProps) {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [movementList, setMovementList] = useState<any[]>([]);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [localities, setLocalities] = useState<Locality[]>([]);


  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getProducts({
          page: currentPage,
          limit: 10,
          search: searchTerm,
        });
        setProducts(res.data);
        setTotalPages(res.totalPages);
      } catch {
        addToast({ title: "Error cargando productos", color: "danger" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentPage, searchTerm]);
  
useEffect(() => {
  const fetchLocalities = async () => {
    try {
      const res = await getLocalities();
      setLocalities(res);
    } catch (err) {
      console.error("Error cargando localidades", err);
    }
  };
  fetchLocalities();
}, []);

  const handleAdd = (product: ProductI, unitId: string, quantity: number) => {
    if (movementList.find((m) => m.productId === product.id)) {
      addToast({ title: "Producto ya agregado", color: "warning" });
      return false;
    }

    setMovementList((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        brandName: product.brand?.name || "",
        unitName: product.unit_of_measure?.name || "",
        unitId,
        quantity,
      },
    ]);
    return true;
  };

  const handleRemove = (productId: string) => {
    setMovementList((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleSubmit = async () => {
    if (movementList.length === 0) {
      addToast({ title: "Agrega al menos un producto", color: "warning" });
      return;
    }

    // Validar cada movimiento antes de enviar
    const movementsWithType = movementList.map((m) => ({
      ...m,
      type, // agrega el tipo aquí
      quantity: Number(m.quantity), // aseguramos que sea number
    }));

    try {
  await onSubmit({
    type,
    movements: movementsWithType,
    invoice_number: invoiceNumber || undefined,
    orderNumber: orderNumber || undefined,
    notes: notes || undefined,
  });

  addToast({ title: "Movimiento guardado", color: "success" });
  setMovementList([]);
  setInvoiceNumber("");
  setOrderNumber("");
  setNotes("");
} catch (error: any) {
  console.error('Error guardando movimiento:', error);
  // Si usas axios, el error puede estar en error.response.data.message
  const message = error?.response?.data?.message || "Error guardando movimiento";
  addToast({ title: message, color: "danger" });
}

  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Movimiento de Inventario
      </h1>

      {/* Panel de información principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Movimiento
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "IN" | "OUT")}
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="IN">Entrada</option>
            <option value="OUT">Salida</option>
          </select>
        </div>

        {/* Orden */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número de Orden (Compra/Venta)
          </label>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
            placeholder="Ej: ORD-20240627-001"
          />
        </div>

        {/* Factura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número de Factura
          </label>
          <input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
            placeholder="Ej: FAC-001234"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm resize-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
            rows={3}
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Tabla de productos (ocupa ambas columnas) */}
        <div className="md:col-span-2 overflow-auto">
          <ProductsTab
            products={products}
            units={[]}
            onAdd={handleAdd}
            showPurchasePrice={false}
            showSalePrice={false}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
             localities={localities}
          />
        </div>
      </div>

      {/* Lista de productos agregados */}
      {movementList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="md:col-span-2 overflow-auto">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Productos Agregados
            </h3>
            <div className="overflow-auto rounded-lg border dark:border-gray-700">
              <table className="min-w-full text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-left">Marca</th>
                    <th className="px-4 py-2 text-left">Unidad</th>
                    <th className="px-4 py-2 text-left">Cantidad</th>
                    <th className="px-4 py-2 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {movementList.map((m) => (
                    <tr
                      key={m.productId}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{m.productName}</td>
                      <td className="px-4 py-2">{m.brandName}</td>
                      <td className="px-4 py-2">{m.unitName}</td>
                      <td className="px-4 py-2">{m.quantity}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleRemove(m.productId)}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50 transition"
        >
          Guardar movimiento
        </button>
      </div>
    </div>
  );
}
