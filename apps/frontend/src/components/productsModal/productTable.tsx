"use client";
import { useEffect, useState } from "react";
import { ProductI } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
import EditProductModal from "./editProductModal";
import DeleteProductModal from "./deleteProductModal";
import ViewProductModal from "./viewProductModal";

interface ProductTableProps {
  products: ProductI[];
  onView: (product: ProductI) => void;
  onUpdated: (product: ProductI) => void;
  onDelete: (product: ProductI) => void;
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  visibleColumns: Record<keyof ProductI, boolean>;
}

export default function ProductTable({
  products,
  onView,
  onUpdated,
  onDelete,
  selectedProducts,
  setSelectedProducts,
  visibleColumns,
}: ProductTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductI;
    direction: "ascending" | "descending";
  } | null>(null);

  const [selected, setSelected] = useState<ProductI | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const requestSort = (key: keyof ProductI) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getValue = (val: any) => {
    if (val === undefined || val === null) return "";
    if (typeof val === "object" && "name" in val) return val.name;
    return val;
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    const valA = getValue(a[sortConfig.key]);
    const valB = getValue(b[sortConfig.key]);
    if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(checked ? products.map((p) => p.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((pid) => pid !== id)
    );
  };

  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  useEffect(() => {
    if (!sortConfig && products.length > 0) {
      setSortConfig({ key: "name", direction: "ascending" });
    }
  }, [products]);

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
      </div>

      <div className="min-w-[1200px]">
        <table className="w-full text-sm border">
          <thead>
            <tr>
              <th className="p-2 border hover:bg-gray-700">
                <Checkbox
                  checked={
                    selectedProducts.length === products.length &&
                    products.length > 0
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(Boolean(checked))
                  }
                />
              </th>
              {Object.keys(visibleColumns).map((key) => {
                const k = key as keyof ProductI;
                if (!visibleColumns[k]) return null;
                return (
                  <th
                    key={key}
                    className="p-2 border cursor-pointer"
                    onClick={() => requestSort(k)}
                  >
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    {sortConfig?.key === k &&
                      (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                  </th>
                );
              })}
              <th className="p-2 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={Object.values(visibleColumns).filter(Boolean).length + 2}
                    className="text-center py-8 text-gray-400"
                  >
                    No hay productos disponibles.
                  </td>
                </tr>
              ) : (
                sortedProducts.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={rowVariants}
                  >
                    <td className="p-2 border hover:bg-gray-700">
                      <Checkbox
                        checked={selectedProducts.includes(p.id)}
                        onCheckedChange={(checked) =>
                          handleSelect(p.id, Boolean(checked))
                        }
                      />
                    </td>
                    {Object.keys(visibleColumns).map((key) => {
                      const k = key as keyof ProductI;
                      if (!visibleColumns[k]) return null;
                      const value = p[k];
                      let content: any = value;

                      if (typeof value === "object" && value !== null) {
                        content = value.name || JSON.stringify(value);
                      }

                      if (k === "sale_price" || k === "purchase_price") {
                        content = `S/ ${content}`;
                      }

                      return (
                        <td
                          key={key}
                          className={`p-2 border ${
                            k === "name" ? "font-medium cursor-pointer" : ""
                          }`}
                          onClick={
                            k === "name"
                              ? () => {
                                  setSelected(p);
                                  setViewOpen(true);
                                  onView(p);
                                }
                              : undefined
                          }
                        >
                          {String(content)}
                        </td>
                      );
                    })}
                    <td className="p-2 border flex gap-2 justify-center">
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-blue-500/20 text-blue-500"
                        onClick={() => {
                          setSelected(p);
                          setOpenEdit(true);
                        }}
                        aria-label="Editar producto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-red-500/20 text-red-500"
                        onClick={() => {
                          setSelected(p);
                          setOpenDelete(true);
                        }}
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <ViewProductModal
            product={selected}
            open={viewOpen}
            onClose={() => setViewOpen(false)}
          />
          <EditProductModal
            product={selected}
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            onUpdated={(updatedProduct) => {
              onUpdated(updatedProduct);
              setOpenEdit(false);
            }}
          />
          <DeleteProductModal
            product={selected}
            open={openDelete}
            onClose={() => setOpenDelete(false)}
            onDelete={() => {
              onDelete(selected);
              setOpenDelete(false);
            }}
            onConfirm={async () => {
              onDelete(selected);
              setOpenDelete(false);
            }}
          />
        </>
      )}
    </div>
  );
}
