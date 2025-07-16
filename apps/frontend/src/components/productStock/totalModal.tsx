"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { searchProductStocks } from "@/lib/api/products/productStocks";
import { ProductStock } from "@/types/productStock";
import { cn } from "@/lib/utils";

export default function ProductStockTotalsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredStocks = stocks;
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const currentData = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (!open) return;

    const fetchStocks = async () => {
      setLoading(true);
      try {
        const data = await searchProductStocks(query);
        setStocks(data);
        setCurrentPage(1); // reset page on new search
      } catch (err) {
        console.error("Error fetching stock data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [open, query]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full dark:bg-zinc-900 dark:text-zinc-100">
        <DialogTitle className="text-xl font-bold mb-2">
          Totales de Productos por Localidad
        </DialogTitle>

        {/* Input de búsqueda */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar producto, marca o localidad..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Tabla de resultados */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted dark:bg-zinc-800">
                  <tr className="text-left border-b font-semibold">
                    <th className="p-2">Producto</th>
                    <th className="p-2">Marca</th>
                    <th className="p-2">Localidad</th>
                    <th className="p-2">Percha</th>
                    <th className="p-2 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, idx) => (
                    <tr
                      key={`${item.product.id}-${item.locality.id}-${item.shelf.id}-${idx}`}
                      className="border-t hover:bg-muted/40"
                    >
                      <td className="p-2">{item.product.name}</td>
                      <td className="p-2">{item.product.brand?.name || "-"}</td>
                      <td className="p-2">{item.locality.name}</td>
                      <td className="p-2">{item.shelf.name}</td>
                      <td className="p-2 text-right">{item.quantity.toFixed(2)}</td>
                    </tr>
                  ))}
                  {currentData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No se encontraron resultados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
