"use client";

import { useState, useEffect } from "react";
import {
  getPurchaseHistory,
  getPurchasePriceTrend,
  getPurchasedProducts,
} from "@/lib/api/purchases/purchaseOrders";
import { Button } from "@heroui/button";
import { ProductI } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
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

  const filteredProducts = products.filter((product) => {
    const brandName = product.brand?.name ?? "";
    const unitName = product.unit_of_measure?.name ?? "";
    const search = searchTerm.toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      brandName.toLowerCase().includes(search) ||
      unitName.toLowerCase().includes(search)
    );
  });

  const handleSelect = (product: ProductI) => {
    setSearchTerm(product.name);
    setShowDropdown(false);
    onSelect(product.id);
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
        className="w-full border rounded px-2 py-1"
        autoComplete="off"
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && filteredProducts.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-auto w-full shadow-lg">
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              onClick={() => handleSelect(product)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-200"
            >
              {product.name} — {product.brand?.name ?? "Sin marca"} —{" "}
              {product.unit_of_measure?.name ?? "Sin unidad"}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && filteredProducts.length === 0 && (
        <div className="absolute z-10 bg-white border border-gray-300 rounded mt-1 px-3 py-2 w-full text-gray-500">
          No se encontraron productos
        </div>
      )}
    </div>
  );
}

export default function PurchaseHistoryPage() {
  const [productId, setProductId] = useState<string>("");
  const [products, setProducts] = useState<ProductI[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getPurchasedProducts();
      setProducts(products);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      const [historyData, trendData] = await Promise.all([
        getPurchaseHistory({ productId }),
        getPurchasePriceTrend(productId),
      ]);
      setHistory(historyData);
      setTrend(trendData);
      setCurrentPage(1);
    };
    fetchData();
  }, [productId]);

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Historial de Compras por Producto</h1>

      <ProductAutocomplete products={products} onSelect={setProductId} />

      {productId && (
        <>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                Historial Detallado
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="p-2 text-left border-r border-gray-300">
                        Fecha
                      </th>
                      <th className="p-2 text-left border-r border-gray-300">
                        Proveedor
                      </th>
                      <th className="p-2 text-left border-r border-gray-300">
                        Factura
                      </th>
                      <th className="p-2 text-right border-r border-gray-300">
                        Cantidad
                      </th>
                      <th className="p-2 text-right border-r border-gray-300">
                        Costo Unitario
                      </th>
                      <th className="p-2 text-right border-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((item, i) => (
                      <tr key={i} className="border-b border-gray-300">
                        <td className="p-2 text-left">
                          {item.purchaseDate?.slice(0, 10)}
                        </td>
                        <td className="p-2 text-left">{item.supplierName}</td>
                        <td className="p-2 text-left">{item.invoiceNumber}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          $
                          {typeof item.unitCost === "number"
                            ? item.unitCost.toFixed(2)
                            : item.unitCost}
                        </td>
                        <td className="p-2 text-right">
                          $
                          {typeof item.totalCost === "number"
                            ? item.totalCost.toFixed(2)
                            : item.totalCost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Paginación */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                  <Button
                    key={index + 1}
                    onPress={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === index + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-black dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    {index + 1}
                  </Button>
                ))}
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
                    dataKey="unitCost"
                    stroke="#8884d8"
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
