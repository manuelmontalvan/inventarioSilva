"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { useEffect, useState, useRef } from "react";
import { ProductStock } from "@/types/productStock";
import {
  getProductStocks,
  createProductStock,
  deleteProductStock,
  updateProductStock,
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
  const [showFormPanel, setShowFormPanel] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        asideRef.current &&
        !asideRef.current.contains(event.target as Node)
      ) {
        setShowFormPanel(false);
      }
    };
    if (showFormPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFormPanel]);

  const [products, setProducts] = useState<ProductI[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [shelves, setShelves] = useState<{ id: string; name: string }[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [shelfId, setShelfId] = useState("");
  const [minStock, setMinStock] = useState("0");
  const [maxStock, setMaxStock] = useState("0");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        addToast({ title: "Error cargando datos", color: "danger" });
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

  const resetForm = () => {
    setEditingStockId(null);
    setProductId("");
    setProductSearch("");
    setLocalityId("");
    setShelfId("");
    setMinStock("0");
    setMaxStock("0");
    setShowFormPanel(false);
  };

  const handleSave = async () => {
    const min = Number(minStock);
    const max = Number(maxStock);

    if (!productId || !localityId || !shelfId)
      return addToast({ title: "Completa todos los campos", color: "danger" });

    if (isNaN(min) || min < 0 || isNaN(max) || max < 0)
      return addToast({ title: "Datos inválidos", color: "danger" });

    try {
      if (editingStockId) {
        await updateProductStock(editingStockId, {
          productId,
          localityId,
          shelfId,
          min_stock: min,
          max_stock: max,
        });
        addToast({ title: "Stock actualizado", color: "success" });
      } else {
        await createProductStock({
          productId,
          localityId,
          shelfId,
          quantity: 0,
          min_stock: min,
          max_stock: max,
        });
        addToast({ title: "Stock creado", color: "success" });
      }
      const updated = await getProductStocks();
      setStocks(updated);
      resetForm();
    } catch (err: unknown) {
      const res = (err as any)?.response;
      if (res?.status === 409) {
        addToast({ title: "Ya existe", color: "warning" });
      } else {
        addToast({ title: "Error al guardar", color: "danger" });
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

  const filteredStocks = stocks.filter(
    (s) =>
      s.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.locality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shelf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  

  return (
    <ProtectedRoute>
      <div className="p-6 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Lista de Ubicaciones de Productos
          </h1>
          <div className="flex gap-2">
            <Button color="success" onPress={() => setShowFormPanel(true)}>
              Crear Stock
            </Button>
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
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocks.map((stock) => (
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
                    <td className="p-2 space-x-2">
                      <Button
                        onPress={() => {
                          setEditingStockId(stock.id);
                          setProductId(stock.product.id);
                          setProductSearch(stock.product.name);
                          setLocalityId(stock.locality.id);
                          setShelfId(stock.shelf.id);
                          setMinStock(stock.min_stock.toString());
                          setMaxStock(stock.max_stock.toString());
                          setShowFormPanel(true);
                        }}
                        variant="bordered"
                        color="success"
                      >
                        Editar
                      </Button>
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

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="ghost"
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((prev) => prev - 1)}
              >
                Anterior
              </Button>
              <span className="px-2 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={currentPage === totalPages}
                onPress={() => setCurrentPage((prev) => prev + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {showFormPanel && (
          <aside
            ref={asideRef}
            className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-lg p-6 border-l z-50 overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingStockId ? "Editar Stock" : "Crear Stock"}
            </h2>
            <div className="space-y-4">
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
              <div onMouseDown={(e) => e.stopPropagation()}>
                <Combobox
                  items={localities.map((l) => ({
                    label: l.name,
                    value: l.id,
                  }))}
                  value={localityId}
                  onChange={setLocalityId}
                  placeholder="Selecciona una localidad"
                />
              </div>

              <div onMouseDown={(e) => e.stopPropagation()}>
                <Combobox
                  items={shelves.map((s) => ({ label: s.name, value: s.id }))}
                  value={shelfId}
                  onChange={setShelfId}
                  placeholder="Selecciona una percha"
                />
              </div>

              <div>
                <p>Stock mínimo</p>
                <Input
                  type="number"
                  value={minStock}
                  onClick={() => clearIfZero(minStock, setMinStock)}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>

              <div>
                <p>Stock máximo</p>
                <Input
                  type="number"
                  value={maxStock}
                  onClick={() => clearIfZero(maxStock, setMaxStock)}
                  onChange={(e) => setMaxStock(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onPress={handleSave}
                  className="flex-1"
                  variant="bordered"
                  color="success"
                >
                  {editingStockId ? "Actualizar" : "Guardar"}
                </Button>
                <Button
                  onPress={resetForm}
                  variant="bordered"
                  color="danger"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </ProtectedRoute>
  );
}
