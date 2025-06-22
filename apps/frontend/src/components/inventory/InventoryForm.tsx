'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { addToast } from '@heroui/toast';

import { createInventoryMovement } from '@/lib/api/inventory';
import { getCategories } from '@/lib/api/products/categories';
import { getProducts } from '@/lib/api/products/products';
import { getLocalities } from '@/lib/api/products/localities';
import { getPurchaseOrders, updatePurchaseOrder } from '@/lib/api/purchases/purchaseOrders';
import { getProductStocks } from '@/lib/api/products/productStocks';

import type { CreateInventoryMovementDto } from '@/types/inventory';
import type { Category, ProductI, Locality } from '@/types/product';
import type { PurchaseOrder } from '@/types/purchaseOrders';
import type { ProductStock } from '@/types/productStock';

interface Props {
  onCreated: () => void;
}

export default function InventoryForm({ onCreated }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [quantityInput, setQuantityInput] = useState('1');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<CreateInventoryMovementDto, 'quantity'>>({
    type: 'IN',
    productId: '',
    localityId: '',
    notes: '',
    invoice_number: '',
    orderNumber: '',
  });

  // Carga inicial
  useEffect(() => {
    getCategories().then(setCategories);
    getProducts().then(setProducts);
    getLocalities().then(setLocalities);
    getPurchaseOrders().then(setOrders);
  }, []);

  // Filtrar productos por categoría
  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.category?.id === selectedCategoryId)
    : products;


  // Al cambiar producto, obtener stocks y localidades para ese producto
  useEffect(() => {
    if (!form.productId) {
      setStocks([]);
      setForm((prev) => ({ ...prev, localityId: '' }));
      return;
    }
    getProductStocks(form.productId).then((data) => {
      setStocks(data);
      if (!data.find((s) => s.locality.id === form.localityId)) {
        setForm((prev) => ({ ...prev, localityId: '' }));
      }
    });
  }, [form.productId]);

  // Localidades filtradas según stocks del producto
 const filteredLocalities = selectedCategoryId
  ? localities.filter((l) => l.category?.id === selectedCategoryId)
  : localities;


  // Al seleccionar orden de compra, setear orderNumber e invoice_number
  const onSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    setForm((prev) => ({
      ...prev,
      orderNumber: order?.orderNumber || '',
      invoice_number: order?.invoice_number || '',
    }));
  };

  // Guardar movimiento y actualizar factura
  const handleSubmit = async () => {
    const quantity = parseInt(quantityInput);
    if (isNaN(quantity) || quantity <= 0) {
      return addToast({ color: 'danger', title: 'Ingresa una cantidad válida' });
    }
    if (!form.productId || !form.localityId) {
      return addToast({ color: 'danger', title: 'Completa todos los campos obligatorios' });
    }

    try {
      // Actualizar factura en la orden si hay orden seleccionada
      if (selectedOrderId) {
        await updatePurchaseOrder(selectedOrderId, { invoice_number: form.invoice_number });
      }

      // Crear movimiento de inventario
      await createInventoryMovement({ ...form, quantity });

      addToast({ title: 'Movimiento registrado', color: 'success' });

      // Resetear formulario
      setQuantityInput('1');
      setSelectedCategoryId('');
      setSelectedOrderId(null);
      setStocks([]);
      setForm({
        type: 'IN',
        productId: '',
        localityId: '',
        notes: '',
        invoice_number: '',
        orderNumber: '',
      });

      // Refrescar órdenes
      const updatedOrders = await getPurchaseOrders();
      setOrders(updatedOrders);

      onCreated();
    } catch (err: any) {
      console.error('Error al crear movimiento:', err);
      addToast({ color: 'danger', title: 'Error al registrar' });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto"
    >
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Tipo de movimiento
        </label>
        <Select
          value={form.type}
          onValueChange={(val) =>
            setForm((prev) => ({ ...prev, type: val as 'IN' | 'OUT' }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN">Entrada</SelectItem>
            <SelectItem value="OUT">Salida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1 dark:text-gray-300">Categoría</label>
        <Combobox
          items={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
          value={selectedCategoryId}
          onChange={(val) => {
            setSelectedCategoryId(val);
            setForm((prev) => ({ ...prev, productId: '', localityId: '' }));
            setStocks([]);
          }}
          placeholder="Seleccionar categoría"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1 dark:text-gray-300">Producto</label>
        <Combobox
          items={filteredProducts.map((p) => ({ label: p.name, value: p.id }))}
          value={form.productId}
          onChange={(val) => setForm((prev) => ({ ...prev, productId: val, localityId: '' }))}
          placeholder="Seleccionar producto"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1 dark:text-gray-300">Localidad</label>
        <Combobox
          items={filteredLocalities.map((l) => ({ label: l.name, value: l.id }))}
          value={form.localityId}
          onChange={(val) => setForm((prev) => ({ ...prev, localityId: val }))}
          placeholder="Seleccionar localidad"
        />
      </div>

      <Input
        label="Cantidad"
        type="number"
        value={quantityInput}
        onChange={(e) => setQuantityInput(e.target.value)}
        min={1}
      />

      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1 dark:text-gray-300">Orden de compra</label>
        <Combobox
          items={orders.map((o) => ({
            label: `${o.orderNumber} - ${o.invoice_number || 'Sin factura'}`,
            value: o.id,
          }))}
          value={selectedOrderId ?? ''}
          onChange={onSelectOrder}
          placeholder="Seleccionar orden de compra"
        />
      </div>

      <Input
        label="Número de factura"
        value={form.invoice_number}
        onChange={(e) => setForm((prev) => ({ ...prev, invoice_number: e.target.value }))}
        placeholder="Ingrese el número de factura"
      />

      <label
        htmlFor="notas"
        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        Notas
      </label>
      <Textarea
        id="notas"
        value={form.notes}
        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        placeholder="Notas (opcional)"
      />

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit">Guardar movimiento</Button>
      </div>
    </form>
  );
}
