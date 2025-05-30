"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { ProductI } from "@/types/product";
import React from "react";

export default function ViewProductModal({
  product,
  open,
  onClose,
}: {
  product: ProductI | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={open} onOpenChange={onClose} backdrop="blur">
      <ModalContent className="bg-gradient-to-br from-gray-900 via-purple-900 to-black border border-white/10 text-white shadow-xl w-full max-w-3xl mx-auto">
        <ModalHeader>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-white">
              Detalles del Producto
            </h2>
            <p className="text-gray-400 text-sm">
              Información completa del producto seleccionado.
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          {product && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-gray-800 rounded-md">
                <h3 className="text-md font-semibold text-gray-200">
                  Nombre:
                </h3>
                <p className="text-gray-400">{product.name}</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-md">
                <h3 className="text-md font-semibold text-gray-200">
                  Categoría:
                </h3>
                <p className="text-gray-400">{product.category.name}</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-md">
                <h3 className="text-md font-semibold text-gray-200">
                  Marca:
                </h3>
                <p className="text-gray-400">{product.brand.name}</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-md">
                <h3 className="text-md font-semibold text-gray-200">
                  Precio Venta:
                </h3>
                <p className="text-gray-400">S/ {product.sale_price}</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-md">
                <h3 className="text-md font-semibold text-gray-200">
                  Stock Actual:
                </h3>
                <p className="text-gray-400">{product.current_quantity}</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-md">
                <h3 className="text-md font-semibold text-gray-200">
                  Ubicación almacén:
                </h3>
                <p className="text-gray-400">
                  {product.warehouse_location || "N/A"}
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-md sm:col-span-2">
                <h3 className="text-md font-semibold text-gray-200">Notas:</h3>
                <p className="text-gray-400">
                  {product.notes?.trim() || "Sin notas"}
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" color="danger" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
