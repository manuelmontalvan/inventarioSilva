"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@/components/ui/textarea";
import { createInventoryMovement } from "@/lib/api/inventory";
import { CreateInventoryMovementDto } from "@/types/inventory";
import { getProducts } from "@/lib/api/products/products";
import { getCategories } from "@/lib/api/products/categories";
import { ProductI, Category } from "@/types/product";
import { addToast } from "@heroui/toast";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  onCreated: () => void;
}

export default function InventoryForm({ onCreated }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState("1");

  const [form, setForm] = useState<
    Omit<CreateInventoryMovementDto, "quantity">
  >({
    type: "IN",
    productId: "",
    notes: "",
  });

  useEffect(() => {
    getCategories().then(setCategories);
    getProducts().then(setProducts);
  }, []);

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.category?.id === selectedCategoryId)
    : products;

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setForm((prev) => ({ ...prev, productId: "" }));
  };

  const handleProductChange = (productId: string) => {
    setForm((prev) => ({ ...prev, productId }));
  };

  const handleSubmit = async () => {
    const quantity = parseInt(quantityInput);

    if (isNaN(quantity) || quantity <= 0) {
      addToast({
        color: "danger",
        title: "Ingresa una cantidad válida",
      });
      return;
    }

    if (!form.productId) {
      addToast({
        color: "danger",
        title: "Selecciona un producto",
      });
      return;
    }

    try {
      await createInventoryMovement({
        ...form,
        quantity,
      });

      addToast({
        title: "Movimiento registrado",
        color: "success",
      });

      // Reiniciar formulario
      setQuantityInput("1");
      setSelectedCategoryId("");
      setForm({
        type: "IN",
        productId: "",
        notes: "",
      });

      onCreated();
    } catch (err: any ) {
       console.error('Error al crear movimiento:', err.response?.data || err.message || err);
      addToast({
        color: "danger",
        title: "Error al registrar",
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto"
    >
      {/* Tipo de movimiento */}
      <div className="flex flex-col">
        <label
          htmlFor="tipo-movimiento"
          className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Tipo de movimiento
        </label>
        <Select
          value={form.type}
          onValueChange={(val) =>
            setForm((prev) => ({ ...prev, type: val as "IN" | "OUT" }))
          }
          aria-label="Tipo de movimiento"
        >
          <SelectTrigger className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-gray-100">
            <SelectValue placeholder="Seleccione tipo" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:text-gray-100 text-sm">
            <SelectItem value="IN">Entrada</SelectItem>
            <SelectItem value="OUT">Salida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Combobox para categoría */}
      <div className="flex flex-col">
        <label
          htmlFor="categoria"
          className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Categoría
        </label>
        <Combobox
          items={categories.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }))}
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          placeholder="Seleccionar categoría"
        />
      </div>

      {/* Combobox para productos filtrados */}
      <div className="flex flex-col">
        <label
          htmlFor="producto"
          className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Producto
        </label>
        <Combobox
          items={filteredProducts.map((p) => ({
            label: p.name,
            value: p.id,
          }))}
          value={form.productId}
          onChange={handleProductChange}
          placeholder="Seleccionar producto"
        />
      </div>

      {/* Input cantidad */}
      <div className="flex flex-col">
        <label
          htmlFor="cantidad"
          className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Cantidad
        </label>
        <Input
          id="cantidad"
          type="number"
          min={1}
          value={quantityInput}
          onChange={(e) => setQuantityInput(e.target.value)}
          onFocus={() => setQuantityInput("")}
          placeholder="Cantidad"
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Textarea notas */}
      <div className="flex flex-col md:col-span-2">
        <label
          htmlFor="notas"
          className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Notas (opcional)
        </label>
        <Textarea
          id="notas"
          value={form.notes}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Notas (opcional)"
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 resize-y text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
          rows={2}
        />
      </div>

      {/* Botón */}
      <div className="md:col-span-2 flex justify-end">
        <Button
          type="submit"
          className="px-5 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          Guardar movimiento
        </Button>
      </div>
    </form>
  );
}
