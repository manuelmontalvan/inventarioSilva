'use client';

import { useEffect, useState } from 'react';
import { ProductStock } from '@/types/productStock';
import { getProductStocks } from '@/lib/api/products/productStocks';


export  function ProductStockTable({ stocks }: { stocks: ProductStock[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border border-gray-700">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2">Producto</th>
            <th className="p-2">Localidad</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Stock Mínimo</th>
            <th className="p-2">Stock Máximo</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id} className="border-t border-gray-600">
              <td className="p-2">{stock.product.name}</td>
              <td className="p-2">{stock.locality.name}</td>
              <td className="p-2">{stock.quantity}</td>
              <td className="p-2">{stock.min_stock}</td>
              <td className="p-2">{stock.max_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductStockPage() {
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductStocks().then((data) => {
      setStocks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock por producto y localidad</h1>
      {loading ? <p>Cargando...</p> : <ProductStockTable stocks={stocks} />}
    </div>
  );
}
