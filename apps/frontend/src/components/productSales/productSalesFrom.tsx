"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/types/customer";
import { ProductI, Category, UnitOfMeasure } from "@/types/product";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@heroui/button";
import { ProductsTab } from "../tabla/productTab";
import { CreateSaleDto } from "@/types/productSales";
import { addToast } from "@heroui/toast";
import { getProducts } from "@/lib/api/products/products";
import ModernDatePicker from "@/components/ui/modernDatePicker";

interface SaleItem {
  productId: string;
  name: string;
  brand_name: string;
  quantity: number;
  unit_price: number;
  unit_name: string;
  stock: number;
  total: number;
}

interface Props {
  customers: Customer[];
  categories: Category[];
  units: UnitOfMeasure[];
  onCreate: (data: CreateSaleDto) => Promise<void> | void;
}

// Función ficticia para llamar al backend y traer productos paginados con filtros.
// Cambia esta función para que llame a tu API real.

export default function SalesForm({
  customers,
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
  const [saleDate, setSaleDate] = useState<Date | undefined>(undefined);

  const [products, setProducts] = useState<ProductI[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Cargar productos del backend cuando cambie página, búsqueda o categoría
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await getProducts({
          search: searchTerm,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          categoryIds: selectedCategoryId ? [selectedCategoryId] : undefined,
        });
        setProducts(res.data);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error("Error fetching products", error);
        addToast({ title: "Error cargando productos", color: "danger" });
      }
    };

    loadProducts();
  }, [searchTerm, currentPage, selectedCategoryId]);

  // Resetea página a 1 si cambian búsqueda o categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryId]);

  const totalGeneral = items.reduce((sum, item) => sum + item.total, 0);

  const handleAddProduct = (
    product: ProductI,
    unitId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      addToast({
        title: "La cantidad debe ser mayor que cero",
        color: "danger",
      });
      return false;
    }

    const exists = items.find((i) => i.productId === product.id);
    if (exists) {
      addToast({ title: "El producto ya fue agregado", color: "danger" });
      return false;
    }

    if (typeof product.sale_price !== "number" || product.sale_price <= 0) {
      addToast({
        title: "El producto no tiene un precio de venta válido",
        color: "danger",
      });
      return false;
    }

    const total = quantity * product.sale_price;

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        quantity,
        brand_name: product.brand?.name || "N/A",
        unit_price: product.sale_price,
        unit_name: product.unit_of_measure?.name || "N/A",
        stock: product.current_quantity,
        total,
      },
    ]);
    return true;
  };

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      addToast({ title: "Debe seleccionar un cliente", color: "danger" });
      return;
    }
    if (!paymentMethod) {
      addToast({
        title: "Debe seleccionar un método de pago",
        color: "danger",
      });
      return;
    }
    if (!status) {
      addToast({
        title: "Debe seleccionar un estado de la venta",
        color: "danger",
      });
      return;
    }
    if (items.length === 0) {
      addToast({ title: "Debe agregar al menos un producto", color: "danger" });
      return;
    }

    try {
      const mappedStatus =
        status === "paid"
          ? "paid"
          : status === "cancelled"
          ? "cancelled"
          : "pending";

      await onCreate({
        customerId: selectedCustomerId,
        payment_method: paymentMethod as "cash" | "credit" | "transfer",
        status: mappedStatus as "paid" | "pending" | "cancelled",
        productSales: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unit_price: item.unit_price,
          ...(saleDate ? { sale_date: saleDate.toISOString() } : {}),
        })),
        notes: "",
      });

      setSelectedCustomerId("");
      setSelectedCustomer(null);
      setPaymentMethod("");
      setStatus("");
      setItems([]);
      setSelectedCategoryId("");
      setSearchTerm("");
      setCurrentPage(1);
      addToast({ color: "success", title: "Venta guardada con éxito" });
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      addToast({ color: "danger", title: "Error al guardar venta" });
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        Registrar Venta
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Cliente */}
        <div>
          <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
            Cliente
          </label>
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
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
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

        {/* Método de Pago */}
        <div>
          <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
            Método de Pago
          </label>
          <Combobox
            items={[
              { label: "Efectivo", value: "cash" },
              { label: "Tarjeta", value: "credit" },
              { label: "Transferencia", value: "transfer" },
            ]}
            value={paymentMethod}
            onChange={setPaymentMethod}
            placeholder="Seleccione método"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <Combobox
            items={[
              { label: "Pendiente", value: "pending" },
              { label: "Completado", value: "paid" },
              { label: "Cancelado", value: "cancelled" },
            ]}
            value={status}
            onChange={setStatus}
            placeholder="Seleccione estado"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
            Filtrar por Categoría
          </label>
          <Combobox
            items={categories.map((c) => ({ label: c.name, value: c.id }))}
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            placeholder="Categoría"
          />
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="max-w-xs mt-2">
        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
          Fecha de Venta (opcional)
        </label>
        <ModernDatePicker
          date={saleDate || undefined}
          onChange={setSaleDate}
        />
      </div>

      {/* Tabla de productos */}
      <ProductsTab
        products={products}
        units={units}
        onAdd={handleAddProduct}
        showPurchasePrice={false}
        showSalePrice={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        localities={[]}
        hideLocality={true}
        selectedLocality={""}
      />

      {/* Tabla de items agregados */}
      {items.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg mt-6">
          <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Marca</th>
                <th className="px-3 py-2 text-left">Unidad</th>
                <th className="px-3 py-2 text-left">Cantidad</th>
                <th className="px-3 py-2 text-left">Precio Unitario</th>
                <th className="px-3 py-2 text-left">Subtotal</th>
                <th className="px-3 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr key={item.productId}>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.brand_name}</td>
                  <td className="px-3 py-2">{item.unit_name}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">${item.unit_price.toFixed(2)}</td>
                  <td className="px-3 py-2">${item.total.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <Button
                      variant="bordered"
                      size="sm"
                      onPress={() => handleRemoveItem(item.productId)}
                      color="danger"
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="text-right font-bold px-3 py-2">
                  Total
                </td>
                <td className="font-bold px-3 py-2">
                  ${totalGeneral.toFixed(2)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Botón */}
      <Button color="success"  onPress={handleSubmit}>
        Guardar Venta
      </Button>
    </div>
  );
}
