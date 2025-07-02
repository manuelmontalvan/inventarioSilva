"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { useEffect, useState, useRef } from "react";
import { ProductStock } from "@/types/productStock";
import {
  getProductStocks,
  createProductStock,
} from "@/lib/api/products/productStocks";
import { getProducts } from "@/lib/api/products/products";
import {
  getLocalities,
  getShelvesByLocality,
} from "@/lib/api/products/localities";

import { ProductI } from "@/types/product";
import { Locality } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { addToast } from "@heroui/toast";

export function ProductStockTable({ stocks }: { stocks: ProductStock[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border border-gray-700">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2">Producto</th>
            <th className="p-2">Localidad</th>
            <th className="p-2">Categoría</th>
            <th className="p-2">Percha</th>
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
              <td className="p-2">{stock.shelf.category?.name ?? "N/A"}</td>
              <td className="p-2">{stock.shelf.name}</td>
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

  const [products, setProducts] = useState<ProductI[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [shelves, setShelves] = useState<{ id: string; name: string }[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [shelfId, setShelfId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [minStock, setMinStock] = useState("0");
  const [maxStock, setMaxStock] = useState("0");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [stocksData, locs] = await Promise.all([
          getProductStocks(),
          getLocalities(),
        ]);
        setStocks(stocksData);
        setLocalities(locs);
      } catch {
        addToast({
          title: "Error cargando datos",
          color: "danger",
          description:
            "No se pudieron cargar los datos de stock o localidades.",
        });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (productSearch.trim() === "") {
      setProducts([]);
      return;
    }
    getProducts({ search: productSearch, limit: 10 }).then(({ data }) => {
      setProducts(data);
      setShowDropdown(true);
    });
  }, [productSearch]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setShelfId("");
    if (localityId) {
      getShelvesByLocality(localityId).then(setShelves);
    } else {
      setShelves([]);
    }
  }, [localityId]);

  const clearIfZero = (value: string, setter: (v: string) => void) => {
    if (value === "0") setter("");
  };

  const handleCreate = async () => {
    const qty = Number(quantity);
    const min = Number(minStock);
    const max = Number(maxStock);

    if (!productId)
      return addToast({ title: "Selecciona un producto", color: "danger" });

    if (!localityId)
      return addToast({ title: "Selecciona una localidad", color: "danger" });

    if (!shelfId)
      return addToast({ title: "Selecciona una percha", color: "danger" });
    if (isNaN(qty) || qty < 0)
      return addToast({
        title: "Cantidad inválida (debe ser 0 o más)",
        color: "danger",
      });
    if (isNaN(min) || min < 0)
      return addToast({ title: "Stock mínimo inválido", color: "danger" });
    if (isNaN(max) || max < 0)
      return addToast({ title: "Stock máximo inválido", color: "danger" });

    try {
      await createProductStock({
        productId,
        localityId,
        shelfId,
        quantity: qty,
        min_stock: min,
        max_stock: max,
      });
      const updated = await getProductStocks();
      setStocks(updated);
      // Reset
      setProductId("");
      setProductSearch("");
      setShelfId("");
      setQuantity("0");
      setMinStock("0");
      setMaxStock("0");
      addToast({ title: "Stock creado exitosamente", color: "success" });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err &&
        "response" in err &&
        (err as any).response?.status === 409
      ) {
        const res = (err as any).response;
        addToast({
          title: "Stock ya existe",
          color: "warning",
          description:
            res.data?.message ||
            "Este producto ya tiene un stock registrado en esa ubicación.",
        });
      } else {
        const res = (err as any)?.response;
        addToast({
          title: "Error al crear stock",
          color: "danger",
          description: res?.data?.message || "Ha ocurrido un error.",
        });
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex gap-6 p-6">
        <aside className="w-1/3 space-y-4 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Registrar Stock</h2>

          <div className="relative" ref={dropdownRef}>
            <Input
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setProductId("");
              }}
            />

            {showDropdown && products.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border mt-1 max-h-60 overflow-y-auto rounded shadow">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setProductId(p.id);
                      setProductSearch(p.name);
                      setShowDropdown(false);
                    }}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Combobox
            items={localities.map((l) => ({ label: l.name, value: l.id }))}
            value={localityId}
            onChange={setLocalityId}
            placeholder="Selecciona una localidad"
          />

          <Combobox
            items={shelves.map((s) => ({ label: s.name, value: s.id }))}
            value={shelfId}
            onChange={setShelfId}
            placeholder="Selecciona una percha"
          />

          <p>Cantidad</p>
          <Input
            type="number"
            value={quantity}
            onClick={() => clearIfZero(quantity, setQuantity)}
            onChange={(e) => setQuantity(e.target.value)}
            min={0}
          />

          <p>Stock mínimo</p>
          <Input
            type="number"
            value={minStock}
            onClick={() => clearIfZero(minStock, setMinStock)}
            onChange={(e) => setMinStock(e.target.value)}
            min={0}
          />

          <p>Stock máximo</p>
          <Input
            type="number"
            value={maxStock}
            onClick={() => clearIfZero(maxStock, setMaxStock)}
            onChange={(e) => setMaxStock(e.target.value)}
            min={0}
          />

          <Button onClick={handleCreate} className="w-full mt-2">
            Crear stock
          </Button>
        </aside>

        <main className="flex-1">
          <h1 className="text-2xl font-bold mb-4">
            Stock por producto y ubicación
          </h1>
          {loading ? <p>Cargando...</p> : <ProductStockTable stocks={stocks} />}
        </main>
      </div>
    </ProtectedRoute>
  );
}
