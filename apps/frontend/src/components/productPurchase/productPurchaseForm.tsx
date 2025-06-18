'use client';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { ProductPurchaseI } from '@/types/productPurchases';
import { createProductPurchase } from '@/lib/api/purchases/productPurchases';
import { getProducts } from '@/lib/api/products/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox'; // Asumimos que tienes un Combobox reutilizable

interface Props {
  onSuccess: () => void;
}

export default function ProductPurchaseForm({ onSuccess }: Props) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<ProductPurchaseI>();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const quantity = watch('quantity');
  const unitCost = watch('unit_cost');

  useEffect(() => {
    const load = async () => {
      const res = await getProducts();
      setProducts(res);
    };
    load();
  }, []);

  const onSubmit = async (data: any) => {
    if (!selectedProduct) return;
    const payload = {
      ...data,
      productId: selectedProduct.id,
      total_cost: data.quantity * data.unit_cost,
    };
    await createProductPurchase(payload);
    reset();
    setSelectedProduct(null);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Producto</label>
        <Combobox
          items={products}
          displayValue={(p) => `${p.name} (${p.brand.name}, ${p.category.name})`}
          selected={selectedProduct}
          onChange={(p) => {
            setSelectedProduct(p);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Cantidad</label>
          <Input type="number" {...register('quantity', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Costo Unitario</label>
          <Input type="number" step="0.01" {...register('unit_cost', { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Costo Total</label>
        <Input value={(quantity ?? 0) * (unitCost ?? 0)} disabled />
      </div>

      <div>
        <label className="block text-sm font-medium">Número de Factura</label>
        <Input {...register('invoice_number')} />
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha de Compra</label>
        <Input type="date" {...register('purchase_date')} />
      </div>

      <div>
        <label className="block text-sm font-medium">Notas</label>
        <Textarea rows={3} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">
        Registrar compra
      </Button>
    </form>
  );
}
