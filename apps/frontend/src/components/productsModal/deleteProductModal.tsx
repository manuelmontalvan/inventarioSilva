"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/api/products";
import { ProductI } from "@/types/product";
import { addToast } from "@heroui/react";

interface Props {
  open: boolean;
  onClose: () => void;
  product: ProductI | null;
  multiple?: boolean;
  onConfirm: () => Promise<void>; // Para acción múltiple externa
  onDelete: () => void; // Callback para notificar que eliminó (refrescar lista)
}

export default function DeleteProductModal({
  open,
  onClose,
  product,
  multiple = false,
  onConfirm,
  onDelete,
}: Props) {
  const handleDelete = async () => {
    try {
      if (multiple) {
        await onConfirm();
        addToast({
          title: "Productos eliminados",
          description: "Los productos seleccionados se eliminaron correctamente.",
          color: "success",
        });
        onClose();
        return;
      }

      if (!product) return;

      await deleteProduct(product.id);

      addToast({
        title: "Producto eliminado",
        description: `El producto "${product.name}" fue eliminado correctamente.`,
        color: "success",
      });

      onDelete();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error?.message || "Ocurrió un error al eliminar el producto.",
        color: "danger",
      });
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-purple-900 to-black border border-white/10 text-white shadow-xl px-4">
        <DialogHeader>
          <DialogTitle>{multiple ? "Eliminar productos" : "Eliminar producto"}</DialogTitle>
        </DialogHeader>
        <p className="mb-4">
          {multiple
            ? "¿Estás seguro de que deseas eliminar los productos seleccionados?"
            : `¿Estás seguro de que deseas eliminar el producto "${product?.name}"?`}
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
