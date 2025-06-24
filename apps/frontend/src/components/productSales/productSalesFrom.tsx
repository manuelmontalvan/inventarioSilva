"use client";

import { useState } from "react";
import { Customer } from "@/types/customer";
import { ProductI, Category, UnitOfMeasure } from "@/types/product";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { ProductsTab } from "../products/productTab";
import { CreateSaleDto } from "@/types/productSales";

interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_name: string;
  stock: number;
  total: number;
}

interface Props {
  customers: Customer[];
  products: ProductI[];
  categories: Category[];
  units: UnitOfMeasure[];
  onCreate: (data: CreateSaleDto) => Promise<void> | void;
}

const paymentMethods = [
  { label: "Efectivo", value: "cash" },
  { label: "Tarjeta", value: "credit" },
  { label: "Transferencia", value: "transfer" },
];

const saleStatuses = [
  { label: "Pendiente", value: "pending" },
  { label: "Completado", value: "completed" },
  { label: "Cancelado", value: "canceled" },
];

export default function SalesForm({
  customers,
  products,
  categories,
  units,
  onCreate,
}: Props) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.category.id === selectedCategoryId)
    : products;

  const totalGeneral = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      alert("Debe seleccionar un cliente");
      return;
    }
    if (!paymentMethod) {
      alert("Debe seleccionar un método de pago");
      return;
    }
    if (!status) {
      alert("Debe seleccionar un estado de la venta");
      return;
    }
    if (items.length === 0) {
      alert("Debe agregar al menos un producto");
      return;
    }

    try {
      // Mapeo para status compatible con backend
      const mappedStatus =
        status === "completed"
          ? "paid"
          : status === "canceled"
          ? "cancelled"
          : status; // ya es "pending"

    await onCreate({
  customerId: selectedCustomerId || undefined, // opcional
  payment_method: paymentMethod as 'cash' | 'credit' | 'transfer',
  status: mappedStatus as 'paid' | 'pending' | 'cancelled',
  productSales: items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unit_price: item.unit_price,
  })),
        notes: "",
      });

      // Limpiar formulario después de guardar
      setSelectedCustomerId("");
      setSelectedCustomer(null);
      setPaymentMethod("");
      setStatus("");
      setItems([]);
      setSelectedCategoryId("");
      alert("Venta guardada con éxito");
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      alert("Error al guardar la venta");
    }
  };

  const handleAddProduct = (
    product: ProductI,
    unitId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      alert("La cantidad debe ser mayor que cero");
      return;
    }

    const unit = units.find((u) => u.id === unitId);
    if (!unit) {
      alert("Unidad no válida");
      return;
    }

    const exists = items.find((i) => i.productId === product.id);
    if (exists) {
      alert("El producto ya fue agregado");
      return;
    }

    const total = quantity * product.sale_price;

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        quantity,
        unit_price: product.sale_price,
        unit_name: unit.abbreviation,
        stock: product.current_quantity,
        total,
      },
    ]);
  };

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Registrar Venta</h2>

      {/* Cliente */}
   <div className="grid grid-cols-2 gap-6 mb-6">
  {/* Cliente */}
  <div>
    <label className="block font-medium mb-1">Cliente</label>
    <Combobox
      items={customers.map((c) => ({
        label: c.identification || c.name,
        value: c.id,
      }))}
      value={selectedCustomerId}
      onChange={(val) => {
        setSelectedCustomerId(val);
        const found = customers.find((c) => c.id === val);
        setSelectedCustomer(found || null);
      }}
      placeholder="Buscar por cédula o nombre"
    />
    {selectedCustomer && (
      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
        <p>
          <strong>Nombre:</strong> {selectedCustomer.name}{" "}
          {selectedCustomer.lastname || ""}
        </p>
        <p>
          <strong>Correo:</strong> {selectedCustomer.email || "N/A"}
        </p>
      </div>
    )}
  </div>

  {/* Método de pago */}
  <div>
    <label className="block font-medium mb-1">Método de Pago</label>
    <Combobox
      items={paymentMethods}
      value={paymentMethod}
      onChange={setPaymentMethod}
      placeholder="Seleccione método"
    />
  </div>

  {/* Estado */}
  <div>
    <label className="block font-medium mb-1">Estado</label>
    <Combobox
      items={saleStatuses}
      value={status}
      onChange={setStatus}
      placeholder="Seleccione estado"
    />
  </div>

  {/* Filtrar por categoría */}
  <div>
    <label className="block font-medium mb-1">Filtrar por Categoría</label>
    <Combobox
      items={categories.map((c) => ({ label: c.name, value: c.id }))}
      value={selectedCategoryId}
      onChange={setSelectedCategoryId}
      placeholder="Categoría"
    />
  </div>
</div>


      {/* Tabla de productos con unidad/cantidad integrada */}
      <ProductsTab
        products={filteredProducts}
        units={units}
        onAdd={handleAddProduct}
      />

      {/* Tabla resumen de productos agregados */}
      {items.length > 0 && (
        <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg mt-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                <th className="px-4 py-2 text-left">Unidad</th>
                <th className="px-4 py-2 text-left">Precio Unitario</th>
                <th className="px-4 py-2 text-left">Subtotal</th>
                <th className="px-4 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr key={item.productId}>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">{item.unit_name}</td>
                  <td className="px-4 py-2">
                    ${Number(item.unit_price).toFixed(2)}
                  </td>

                  <td className="px-4 py-2">${item.total.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="text-right font-bold px-4 py-2">
                  Total
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

      <Button className="w-full mt-4" onClick={handleSubmit}>
        Guardar Venta
      </Button>
    </div>
  );
}
