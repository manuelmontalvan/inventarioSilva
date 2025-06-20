import React, { useState } from "react";
import {
  CreatePurchaseOrderDto,
  CreateProductPurchaseDto,
} from "@/types/purchaseOrders";
import { SupplierI } from "@/types/supplier";
import { Category, ProductI } from "@/types/product";
import { Combobox } from "../ui/combobox";

interface Props {
  suppliers: SupplierI[];
  products: ProductI[];
  categories: Category[];
  onCreate: (newOrder: CreatePurchaseOrderDto) => Promise<void>;
}

export default function PurchaseOrderForm({
  suppliers,
  products,
  categories,
  onCreate,
}: Props) {
  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<CreateProductPurchaseDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("1.00");

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.category?.id === selectedCategoryId)
    : products;

  const handleAddItem = () => {
    const qty = Number(quantity);
    const cost = Number(unitCost);
    if (!selectedProductId || qty <= 0 || cost <= 0) return;

    const total_cost = qty * cost;

    const existingIndex = items.findIndex(
      (i) => i.productId === selectedProductId
    );
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].unit_cost = cost;
      updated[existingIndex].total_cost =
        updated[existingIndex].quantity * cost;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProductId,
          supplierId,
          invoice_number: invoiceNumber,
          quantity: qty,
          unit_cost: cost,
          total_cost,
          notes,
        },
      ]);
    }

    setSelectedCategoryId("");
    setSelectedProductId("");
    setQuantity("1");
    setUnitCost("1.00");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !purchaseDate || items.length === 0) return;

    const newOrder: CreatePurchaseOrderDto = {
      supplierId,
      invoice_number: invoiceNumber,
      purchase_date: purchaseDate,
      notes,
      items,
    };
    await onCreate(newOrder);

    setSupplierId("");
    setInvoiceNumber("");
    setPurchaseDate("");
    setNotes("");
    setItems([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        Nueva Orden de Compra
      </h2>

      <div className="space-y-4">
        <div className="dark:text-white">
          <label className="block text-sm font-medium text-gray-700  dark:text-gray-300 mb-1">
            Proveedor
          </label>
          <Combobox
            items={suppliers.map((s) => ({ label: s.name, value: s.id }))}
            value={supplierId}
            onChange={(val) => setSupplierId(val)}
            placeholder="Seleccionar proveedor"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Factura"
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
    
            required
          />
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>

        <textarea
          placeholder="Notas"
          className="w-full px-4 py-2 border rounded-md resize-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:text-white">
          <Combobox
            items={categories.map((c) => ({ label: c.name, value: c.id }))}
            value={selectedCategoryId}
            onChange={(val) => setSelectedCategoryId(val)}
            placeholder="Seleccionar categoría"
          />
          <Combobox
            items={filteredProducts.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
            value={selectedProductId}
            onChange={(val) => setSelectedProductId(val)}
            placeholder="Seleccionar producto"
          />

          <input
            type="number"
            min={1}
            placeholder="Cantidad"
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onFocus={() => setQuantity("")}

          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Costo Unitario"
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            onFocus={() => setUnitCost("")}

          />
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Agregar Producto
        </button>

        {items.length > 0 && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm mt-4">
            {items.map((item, idx) => {
              const name =
                products.find((p) => p.id === item.productId)?.name ||
                item.productId;
              return (
                <li
                  key={idx}
                  className="flex justify-between py-2 text-gray-700 dark:text-gray-300"
                >
                  <span className="truncate">{name}</span>
                  <span>
                    {item.quantity} x ${item.unit_cost.toFixed(2)}
                  </span>
                  <span className="font-semibold">
                    ${item.total_cost.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition"
        >
          Crear Orden
        </button>
      </div>
    </form>
  );
}
