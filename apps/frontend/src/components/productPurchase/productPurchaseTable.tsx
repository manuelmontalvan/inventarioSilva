'use client';
import { ProductPurchaseI } from '@/types/productPurchases';
import { useEffect, useState } from 'react';
import { getProductPurchases } from '@/lib/api/purchases/productPurchases';
import { Input } from '@/components/ui/input';
import { Table } from '@/components/ui/table';

export default function ProductPurchaseTable() {
  const [purchases, setPurchases] = useState<ProductPurchaseI[]>([]);
  const [filtered, setFiltered] = useState<ProductPurchaseI[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await getProductPurchases();
      setPurchases(data);
      setFiltered(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(
      purchases.filter(p =>
        p.product.name.toLowerCase().includes(s) ||
        p.product.brand.name.toLowerCase().includes(s) ||
        p.product.category.name.toLowerCase().includes(s)
      )
    );
  }, [search, purchases]);

  return (
    <div>
      <Input placeholder="Buscar producto, marca o categoría..." value={search} onChange={e => setSearch(e.target.value)} />
      <Table>
        {/* Cabecera */}
        <thead>
          <tr>
            <th>Producto</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Costo Unitario</th>
            <th>Total</th>
            <th>Fecha</th>
          </tr>
        </thead>
        {/* Datos */}
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <td>{p.product.name}</td>
              <td>{p.product.brand.name}</td>
              <td>{p.product.category.name}</td>
              <td>{p.quantity}</td>
              <td>S/. {p.unit_cost}</td>
              <td>S/. {p.total_cost}</td>
              <td>{new Date(p.purchase_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
