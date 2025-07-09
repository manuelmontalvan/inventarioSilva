"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { useEffect, useState, useRef } from "react";
import { ProductStock } from "@/types/productStock";
import {
  getProductStocks,
  createProductStock,
  deleteProductStock,
} from "@/lib/api/products/productStocks";
import { getProducts } from "@/lib/api/products/products";
import {
  getLocalities,
  getShelvesByLocality,
} from "@/lib/api/products/localities";
import { ProductI, Locality } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";

export default function ProductStockPage() {
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      return addToast({ title: "Cantidad inválida", color: "danger" });
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
      addToast({ title: "Stock creado", color: "success" });
    } catch (err: unknown) {
      const res = (err as any)?.response;
      if (res?.status === 409) {
        addToast({ title: "Ya existe", color: "warning" });
      } else {
        addToast({ title: "Error al crear", color: "danger" });
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductStock(id);
      setStocks((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      addToast({ title: "Eliminado", color: "success" });
    } catch {
      addToast({ title: "Error al eliminar", color: "danger" });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(deleteProductStock));
      setStocks((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      addToast({ title: "Stocks eliminados", color: "success" });
    } catch {
      addToast({ title: "Error eliminando múltiples", color: "danger" });
    }
  };

  const filteredStocks = stocks.filter((s) =>
  s.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  s.locality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  s.shelf.name.toLowerCase().includes(searchTerm.toLowerCase())
);





  return (
    <ProtectedRoute>
      <div className="flex gap-6 p-6">
        <aside className="w-1/3 space-y-4 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Ubicacion de Producto</h2>

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

          <p>Stock mínimo</p>
          <Input
            type="number"
            value={minStock}
            onClick={() => clearIfZero(minStock, setMinStock)}
            onChange={(e) => setMinStock(e.target.value)}
          />

          <p>Stock máximo</p>
          <Input
            type="number"
            value={maxStock}
            onClick={() => clearIfZero(maxStock, setMaxStock)}
            onChange={(e) => setMaxStock(e.target.value)}
          />

          <Button onClick={handleCreate} className="w-full mt-2">
            Crear stock
          </Button>
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Lista de Ubicaciones de Productos
            </h1>
            {selectedIds.length > 0 && (
              <Button
                variant="bordered"
                color="danger"
                onPress={handleBulkDelete}
              >
                Eliminar seleccionados ({selectedIds.length})
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            <Input
              type="text"
              placeholder="Buscar en tabla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/3"
            />
          </div>

          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-gray-700">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === stocks.length}
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked ? stocks.map((s) => s.id) : []
                          )
                        }
                      />
                    </th>
                    <th className="p-2">Producto</th>
                    <th className="p-2">Localidad</th>
                    <th className="p-2">Categoría</th>
                    <th className="p-2">Percha</th>
                    <th className="p-2">Cantidad</th>
                    <th className="p-2">Mínimo</th>
                    <th className="p-2">Máximo</th>
                    <th className="p-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (

                    <tr key={stock.id} className="border-t border-gray-600">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(stock.id)}
                          onChange={() => toggleSelect(stock.id)}
                        />
                      </td>
                      <td className="p-2">{stock.product.name}</td>
                      <td className="p-2">{stock.locality.name}</td>
                      <td className="p-2">
                        {stock.shelf.category?.name ?? "N/A"}
                      </td>
                      <td className="p-2">{stock.shelf.name}</td>
                      <td className="p-2">{stock.quantity}</td>
                      <td className="p-2">{stock.min_stock}</td>
                      <td className="p-2">{stock.max_stock}</td>
                      <td className="p-2">
                        <Button
                          onPress={() => handleDelete(stock.id)}
                          color="danger"
                          variant="bordered"
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
