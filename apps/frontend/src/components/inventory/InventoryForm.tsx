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
  shelfId?: string;
  shelfName?: string;
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
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>("");

 useEffect(() => {
  const fetch = async () => {
    try {
      const res = await getProducts({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      });
      setProducts(res.data);
      setTotalPages(res.totalPages);
    } catch {
      addToast({ title: "Error cargando productos", color: "danger" });
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

  const handleAdd = (
    product: ProductI,
    localityId: string,
    quantity: number,
    _purchasePrice?: number,
    shelfId?: string,
    shelfName?: string
  ) => {
    if (!localityId) {
      addToast({ title: "No se encontró localidad", color: "danger" });
      return false;
    }

    setMovementList((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        brandName: product.brand?.name || "",
        unitName: product.unit_of_measure?.name || "",
        unitId: product.unit_of_measure?.id || "",
        quantity,
        localityId,
        shelfId,
        shelfName,
      },
    ]);
    return true;
  };

  const handleRemove = (productId: string, shelfId?: string) => {
    setMovementList((prev) =>
      prev.filter((p) => p.productId !== productId || p.shelfId !== shelfId)
    );
  };

  const handleSubmit = async () => {
    if (movementList.length === 0) {
      addToast({ title: "Agrega al menos un producto", color: "warning" });
      return;
    }
    const movementsToSend = movementList.map(({ shelfName, ...rest }) => rest);
    try {
      await onSubmit({
        type,
        movements: movementsToSend,
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
      const backendError = (
        error as {
          response?: { data?: { message?: string; details?: unknown } };
          message?: string;
        }
      )?.response?.data;

      const message =
        backendError?.message ||
        (error as Error)?.message ||
        "Error guardando movimiento";

      if (
        backendError &&
        Array.isArray(backendError.details) &&
        backendError.details.every((msg) => typeof msg === "string")
      ) {
        backendError.details.forEach((msg) => {
          addToast({ title: msg, color: "danger" });
        });
      } else {
        addToast({ title: message, color: "danger" });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
        Movimiento de Inventario
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-1">
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
          <label className="block text-sm font-medium mb-1">
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
          <label className="block text-sm font-medium mb-1">
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
          <label className="block text-sm font-medium mb-1">
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
          <label className="block text-sm font-medium mb-1">
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

      <div className="min-h-[500px]">
        <ProductsTab
          products={products}
          units={[]}
          onAdd={handleAdd}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          localities={localities}
          selectedLocality={selectedLocality}
        />
      </div>

      {movementList.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
            Productos agregados
          </h3>
          <table className="min-w-full text-sm border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-md">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white">
              <tr>
                <th className="px-4 py-2 text-left border-r">Producto</th>
                <th className="px-4 py-2 text-left border-r">Marca</th>
                <th className="px-4 py-2 text-left border-r">Unidad</th>
                <th className="px-4 py-2 text-left border-r">Cantidad</th>
                <th className="px-4 py-2 text-left border-r">Localidad</th>
                <th className="px-4 py-2 text-left border-r">Percha</th>
                <th className="px-4 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              {movementList.map((m) => (
                <tr
                  key={`${m.productId}-${m.shelfId ?? "default"}`}
                  className="border-t"
                >
                  <td className="px-4 py-2 border-r">{m.productName}</td>
                  <td className="px-4 py-2 border-r">{m.brandName}</td>
                  <td className="px-4 py-2 border-r">{m.unitName}</td>
                  <td className="px-4 py-2 border-r">{m.quantity}</td>
                  <td className="px-4 py-2 border-r">
                    {localities.find((l) => l.id === m.localityId)?.name ||
                      "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r">{m.shelfName ?? "-"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemove(m.productId, m.shelfId)}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          Guardar movimiento
        </button>
      </div>
    </div>
  );
}
