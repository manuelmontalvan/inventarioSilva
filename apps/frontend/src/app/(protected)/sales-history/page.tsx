"use client";

import { useEffect, useState } from "react";
import {
  getSoldProducts,
  getSaleHistory,
  getSalePriceTrend,
} from "@/lib/api/sales/productSales";
import { ProductI } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function ProductAutocomplete({
  products,
  onSelect,
}: {
  products: ProductI[];
  onSelect: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = products.filter((p) => {
    const brand = p.brand?.name || "";
    const unit = p.unit_of_measure?.name || "";
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      brand.toLowerCase().includes(term) ||
      unit.toLowerCase().includes(term)
    );
  });

  const handleSelect = (p: ProductI) => {
    setSearchTerm(p.name);
    setShowDropdown(false);
    onSelect(p.id);
  };

  return (
    <div className="relative w-[300px]">
      <input
        type="text"
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="w-full border rounded px-2 py-1"
      />
      {showDropdown && (
        <ul className="absolute bg-white z-10 border mt-1 rounded shadow w-full max-h-60 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <li
                key={p.id}
                onClick={() => handleSelect(p)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {p.name} — {p.brand?.name || "Sin marca"} —{" "}
                {p.unit_of_measure?.name || "Sin unidad"}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">
              No se encontraron productos
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function ProductSalesHistory() {
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState<ProductI[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => {
    getSoldProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (!productId) return;
    Promise.all([getSaleHistory(productId), getSalePriceTrend(productId)]).then(
      ([h, t]) => {
        setHistory(h);
        setTrend(t);
      }
    );
  }, [productId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Historial de Ventas por Producto</h1>

      <ProductAutocomplete products={products} onSelect={setProductId} />

      {productId && (
        <>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                Historial Detallado
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Cliente</th>
                      <th className="p-2 text-left">Factura</th>
                      <th className="p-2 text-right">Cantidad</th>
                      <th className="p-2 text-right">Precio Unitario</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{item.saleDate?.slice(0, 10)}</td>
                        <td className="p-2">{item.customerName || "-"}</td>
                        <td className="p-2">{item.invoiceNumber || "-"}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          ${Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="p-2 text-right">
                          ${Number(item.totalPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                Tendencia de Precio
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="unitPrice"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
