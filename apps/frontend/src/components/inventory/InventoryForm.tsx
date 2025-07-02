"use client";

import React, { useEffect, useState } from "react";
import { ProductI, Locality } from "@/types/product";
import { getProducts } from "@/lib/api/products/products";
import { ProductsTab } from "@/components/tabla/productTab";
import { addToast } from "@heroui/toast";
import { getLocalities } from "@/lib/api/products/localities";

interface Movement {
  productId: string;
  quantity: number;
  unitId: string;
  productName: string;
  brandName: string;
  unitName: string;
  localityId: string;
}

interface InventoryFormProps {
  onSubmit: (data: {
    type: "IN" | "OUT";
    movements: Movement[];
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
  const [movementList, setMovementList] = useState<Movement[]>([]);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>("");

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
        setSelectedLocality(res[0]?.id || "");
      } catch {
        addToast({ title: "Error cargando localidades", color: "danger" });
      }
    };
    fetchLocalities();
  }, []);

  const handleAdd = (product: ProductI, unitId: string, quantity: number) => {
    if (movementList.find((m) => m.productId === product.id)) {
      addToast({ title: "Producto ya agregado", color: "warning" });
      return false;
    }

    if (!selectedLocality) {
      addToast({ title: "Selecciona una localidad", color: "warning" });
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
        localityId: selectedLocality,
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

    try {
      await onSubmit({
        type,
        movements: movementList,
        invoice_number: invoiceNumber || undefined,
        orderNumber: orderNumber || undefined,
        notes: notes || undefined,
      });

      addToast({ title: "Movimiento guardado", color: "success" });
      setMovementList([]);
      setInvoiceNumber("");
      setOrderNumber("");
      setNotes("");
    } catch (error: unknown) {
      let message = "Error guardando movimiento";

      if (
        error &&
        typeof error === "object"
      ) {
        if ("response" in error && error.response && typeof error.response === "object") {
          const response = error.response as { data?: { message?: string } };
          if (response.data?.message) {
            message = response.data.message;
          }
        } else if ("message" in error && typeof (error as { message: unknown }).message === "string") {
          message = (error as { message: string }).message;
        }
      }

      addToast({ title: message, color: "danger" });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Movimiento de Inventario
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Localidad destino
          </label>
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            {localities.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

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

        <div className="md:col-span-2">
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
            mode="compra"
          />
        </div>
      </div>

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
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Marca</th>
                    <th className="px-4 py-2">Unidad</th>
                    <th className="px-4 py-2">Cantidad</th>
                    <th className="px-4 py-2">Localidad</th>
                    <th className="px-4 py-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {movementList.map((m) => (
                    <tr key={m.productId}>
                      <td className="px-4 py-2">{m.productName}</td>
                      <td className="px-4 py-2">{m.brandName}</td>
                      <td className="px-4 py-2">{m.unitName}</td>
                      <td className="px-4 py-2">{m.quantity}</td>
                      <td className="px-4 py-2">
                        {localities.find((l) => l.id === m.localityId)?.name}
                      </td>
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
