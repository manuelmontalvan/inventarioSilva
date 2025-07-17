"use client";

import React, { useEffect, useState } from "react";
import { ProductI, Locality } from "@/types/product";
import { getProducts } from "@/lib/api/products/products";
import { ProductsTab } from "@/components/tabla/productTab";
import { addToast } from "@heroui/toast";
import { getLocalities } from "@/lib/api/products/localities";
import { getOrderDetailsByOrderNumber } from "@/lib/api/shared";

interface Movement {
  productId: string;
  quantity: number;
  unitId: string;
  productName: string;
  brandName: string;
  unitName: string;
  localityId?: string;
  shelfId?: string;
  shelfName?: string;
  availableStocks?: {
    localityId: string;
    localityName: string;
    shelfId?: string;
    shelfName?: string;
    quantity: number;
  }[];
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProducts({
          page: currentPage,
          limit: 1000,
          search: searchTerm,
        });
        setProducts(res.data);
        setTotalPages(1);
      } catch {
        addToast({ title: "Error cargando productos", color: "danger" });
      }
    };
    fetch();
  }, [currentPage, searchTerm, refreshKey]);

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
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderNumber || orderNumber.trim() === "") return;

      try {
        const res = await getOrderDetailsByOrderNumber(orderNumber.trim());

        if (!res || !Array.isArray(res.items)) {
          addToast({
            title: "Orden no encontrada o sin productos",
            color: "warning",
          });
          return;
        }

        const productsMap = new Map(products.map((p) => [p.id, p]));

        const mappedMovements: Movement[] = res.items.map((item) => {
          const product = productsMap.get(item.productId);

          const availableStocks =
            product?.stocks
              ?.filter((s) => s.locality?.id && s.shelf?.id) // solo si tiene percha y localidad
              .map((s) => ({
                localityId: s.locality!.id,
                localityName: s.locality!.name,
                shelfId: s.shelf!.id,
                shelfName: s.shelf!.name,
                quantity: s.quantity,
              })) ?? [];

          const defaultStock = availableStocks[0];
          if (availableStocks.length === 0) {
            addToast({
              title: `El producto "${item.productName}" no tiene stock disponible con percha asignada.`,
              color: "warning",
            });
          }

          return {
            productId: item.productId,
            productName: item.productName,
            brandName: item.brand || "",
            unitName: item.unit || "",
            unitId: product?.unit_of_measure?.id || "",
            quantity: item.quantity,
            availableStocks,
            localityId: defaultStock?.localityId,
            shelfId: defaultStock?.shelfId,
            shelfName: defaultStock?.shelfName,
          };
        });

        setMovementList(mappedMovements);

        addToast({
          title: `Se cargaron ${mappedMovements.length} productos de la orden`,
          color: "success",
        });
      } catch {
        setMovementList([]);
        addToast({
          title: "Error cargando la orden",
          color: "danger",
        });
      }
    };

    const timeout = setTimeout(() => {
      loadOrderDetails();
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [orderNumber, products]);

  const handleAdd = (
    product: ProductI,
    localityId: string,
    quantity: number,
    _purchasePrice?: number,
    shelfId?: string,
    shelfName?: string
  ) => {
    const unitId = product.unit_of_measure?.id;
    if (!unitId || !/^[0-9a-fA-F\-]{36}$/.test(unitId)) {
      addToast({ title: "Unidad de medida inválida", color: "danger" });
      return false;
    }

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
        unitId,
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

    // Mostrar advertencias si hay shelves que podrían quedar bajo mínimo
    if (type === "OUT") {
      movementList.forEach((movement) => {
        const selectedStock = movement.availableStocks?.find(
          (s) =>
            s.localityId === movement.localityId &&
            s.shelfId === movement.shelfId
        );

        if (selectedStock && selectedStock.quantity - movement.quantity < 0) {
          addToast({
            title: `Stock insuficiente para "${movement.productName}" en ${selectedStock.shelfName}`,
            color: "danger",
          });
        } else if (
          selectedStock &&
          selectedStock.quantity - movement.quantity < 5 // puedes reemplazar 5 por stock mínimo real
        ) {
          addToast({
            title: `Advertencia: Stock bajo para "${movement.productName}" en ${selectedStock.shelfName}`,
            color: "warning",
          });
        }
      });
    }

    try {
      // Eliminar `availableStocks` y enviar solo lo necesario
      const cleanMovements = movementList.map((movement) => {
        const copy = { ...movement };
        delete copy.availableStocks;
        return copy;
      });

      await onSubmit({
        type,
        movements: cleanMovements,
        invoice_number: invoiceNumber || undefined,
        orderNumber: orderNumber || undefined,
        notes: notes || undefined,
      });

      addToast({ title: "Movimiento guardado", color: "success" });
      setRefreshKey((prev) => prev + 1); // fuerza recarga de productos y stock

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
                <th className="px-4 py-2 text-left border-r">
                  Localidad + Percha
                </th>
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
                    {m.availableStocks ? (
                      <select
                        value={`${m.localityId ?? ""}|${m.shelfId ?? ""}`}
                        onChange={(e) => {
                          const [locId, shelfId] = e.target.value.split("|");
                          const stock = m.availableStocks?.find(
                            (s) =>
                              s.localityId === locId && s.shelfId === shelfId
                          );
                          setMovementList((prev) =>
                            prev.map((mov) =>
                              mov.productId === m.productId
                                ? {
                                    ...mov,
                                    localityId: stock?.localityId,
                                    shelfId: stock?.shelfId,
                                    shelfName: stock?.shelfName,
                                    // quantity: mov.quantity, <-- no cambiar cantidad aquí
                                  }
                                : mov
                            )
                          );
                        }}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="">Seleccionar...</option>
                        {m.availableStocks.map((s) => (
                          <option
                            key={`${s.localityId}-${s.shelfId}`}
                            value={`${s.localityId}|${s.shelfId}`}
                          >
                            {s.localityName} - {s.shelfName || "Sin percha"}{" "}
                            (Stock: {s.quantity})
                          </option>
                        ))}
                      </select>
                    ) : (
                      localities.find((l) => l.id === m.localityId)?.name ||
                      "N/A"
                    )}
                  </td>
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
