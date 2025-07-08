"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SupplierI } from "@/types/supplier";
import { Category, ProductI, UnitOfMeasure } from "@/types/product";
import { Combobox } from "../ui/combobox";
import { Button } from "@/components/ui/button";
import {
  CreatePurchaseOrderDto,
  CreateProductPurchaseDto,
} from "@/types/purchaseOrders";
import { getProducts } from "@/lib/api/products/products";
import { addToast } from "@heroui/toast";
import { ProductsTab } from "@/components/tabla/productTab";

// Extendemos el tipo para guardar información visual
type PurchaseItemWithDisplay = CreateProductPurchaseDto & {
  productName: string;
  brandName?: string;
  unitName?: string;
};

interface Props {
  suppliers: SupplierI[];
  categories: Category[];
  onCreate: (data: CreatePurchaseOrderDto) => Promise<void>;
}

export default function PurchaseOrderForm({
  suppliers,
  categories,
  onCreate,
}: Props) {
  const [supplierId, setSupplierId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [items, setItems] = useState<PurchaseItemWithDisplay[]>([]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const limit = 10;

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts({
        search,
        page,
        limit,
        categoryIds: selectedCategoryId ? [selectedCategoryId] : undefined,
      });

      setProducts(res.data);
      setTotalPages(res.totalPages);

      const uniqueUnitsMap: Record<string, UnitOfMeasure> = {};
      res.data.forEach((p) => {
        if (p.unit_of_measure && !uniqueUnitsMap[p.unit_of_measure.id]) {
          uniqueUnitsMap[p.unit_of_measure.id] = p.unit_of_measure;
        }
      });
      setUnits(Object.values(uniqueUnitsMap));
    } catch (error) {
      console.error("Error cargando productos", error);
      addToast({ color: "danger", title: "Error cargando productos" });
    }
  }, [search, page, selectedCategoryId]);

  useEffect(() => {
    setPage(1);
    fetchProducts();
  }, [search, selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (page > 1) fetchProducts();
  }, [page, fetchProducts]);

  const totalGeneral = items.reduce((sum, item) => sum + item.total_cost, 0);

  const handleAddProduct = (
    product: ProductI,
    unitId: string,
    quantity: number,
    purchasePrice?: number
  ): boolean => {
    if (!supplierId) {
      addToast({
        title: "Selecciona un proveedor antes de agregar productos",
        color: "danger",
      });
      return false;
    }

    const exists = items.find(
      (i) => i.productId === product.id && i.unit_id === unitId
    );
    if (exists) {
      addToast({
        title: "Este producto con la unidad seleccionada ya fue agregado.",
        color: "danger",
      });
      return false;
    }

    const unit_cost = purchasePrice ?? product.purchase_price ?? 0;
    if (unit_cost <= 0) {
      addToast({
        title: "El producto no tiene precio de compra válido.",
        color: "danger",
      });
      return false;
    }

    const total_cost = unit_cost * quantity;

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        supplierId,
        invoice_number: invoiceNumber,
        quantity,
        unit_cost,
        total_cost,
        notes: "",
        unitOfMeasureId: product.unit_of_measure?.id,
        brandId: product.brand?.id,
        unit_id: product.unit_of_measure?.id ?? "",
        brand_id: product.brand?.id ?? "",
        productName: product.name,
        brandName: product.brand?.name,
        unitName: product.unit_of_measure?.name,
      },
    ]);

    return true;
  };

  const handleRemoveItem = (productId: string, unitId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.unit_id === unitId)
      )
    );
  };

  const handleSubmit = async () => {
    if (!supplierId) {
      return addToast({ title: "Selecciona un proveedor", color: "danger" });
    }
    if (items.length === 0) {
      return addToast({
        title: "Agrega al menos un producto",
        color: "danger",
      });
    }

    try {
      const newOrder: CreatePurchaseOrderDto = {
        supplierId,
        invoice_number: invoiceNumber,
        notes,
        items: items.map((item) => ({
          productId: item.productId,
          supplierId,
          invoice_number: invoiceNumber,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          notes: item.notes,
          unitOfMeasureId: item.unit_id,
          brandId: item.brand_id,
        })),
      };

      await onCreate(newOrder);
      addToast({ color: "success", title: "Orden de compra creada" });

      // Reset form
      setSupplierId("");
      setInvoiceNumber("");
      setNotes("");
      setItems([]);
      setSelectedCategoryId("");
      setSearch("");
      setPage(1);
      await fetchProducts();
    } catch (error) {
      console.error(error);
      addToast({ color: "danger", title: "Error al crear orden" });
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Nueva Orden de Compra</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Proveedor</label>
          <Combobox
            items={suppliers.map((s) => ({ label: s.name, value: s.id }))}
            value={supplierId}
            onChange={setSupplierId}
            placeholder="Seleccionar proveedor"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Categoría</label>
          <Combobox
            items={categories.map((c) => ({ label: c.name, value: c.id }))}
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            placeholder="Filtrar por categoría"
          />
        </div>
      </div>

      <div className="min-h-[500px]">
        <ProductsTab
          products={products}
          units={units}
          onAdd={handleAddProduct}
          showPurchasePrice={true}
          showSalePrice={false}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          searchTerm={search}
          onSearchChange={(newSearch) => {
            setSearch(newSearch);
            setPage(1);
          }}
          localities={[]} // no se usa
          mode="salida" // para que NO aparezca select de localidad
        />
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg mt-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Unidad</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                <th className="px-4 py-2 text-left">Costo Unitario</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr key={`${item.productId}-${item.unit_id}`}>
                  <td className="px-4 py-2">{item.productName}</td>
                  <td className="px-4 py-2">{item.brandName ?? "—"}</td>
                  <td className="px-4 py-2">{item.unitName ?? "—"}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">${item.unit_cost.toFixed(2)}</td>
                  <td className="px-4 py-2">${item.total_cost.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleRemoveItem(item.productId, item.unit_id ?? "")
                      }
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="text-right font-bold px-4 py-2">
                  Total General
                </td>
                <td className="font-bold px-4 py-2">
                  ${totalGeneral.toFixed(2)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <label className="block font-medium mb-1">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white resize-none"
          rows={3}
          placeholder="Notas adicionales..."
        />
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md"
      >
        Crear Orden de Compra
      </Button>
    </div>
  );
}
