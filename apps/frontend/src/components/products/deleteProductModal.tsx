"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/api/products/products";
import { ProductI } from "@/types/product";
import { addToast } from "@heroui/react";

interface Props {
  open: boolean;
  onClose: () => void;
  product: ProductI | null;
  multiple?: boolean;
  onConfirm?: () => Promise<void>; // opcional
  onDelete: () => void;
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
        await onConfirm?.(); 
        addToast({
          title: "Productos eliminados",
          description: "Los productos seleccionados se eliminaron correctamente.",
          color: "success",
        });
        onClose();
        return;
      }else {

      if (!product) return;

      await deleteProduct(product.id);

      addToast({
        title: "Producto eliminado",
        description: `El producto "${product.name}" fue eliminado correctamente.`,
        color: "success",
      });

      onDelete();
      onClose();
    }
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
      <DialogContent
        className="sm:max-w-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xl transition-colors"
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {multiple ? "Eliminar productos" : "Eliminar producto"}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm sm:text-base mt-2 mb-5 leading-relaxed text-gray-600 dark:text-gray-300">
          {multiple
            ? "¿Estás seguro de que deseas eliminar los productos seleccionados?"
            : `¿Estás seguro de que deseas eliminar el producto "${product?.name}"?`}
        </p>

        <div className="flex justify-end gap-2">
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
