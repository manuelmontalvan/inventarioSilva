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
      <ModalContent className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white transition-all">
        <ModalHeader>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">Detalles del Producto</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Consulta toda la información almacenada.
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
          {product && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Nombre", value: product.name },
                { label: "Categoría", value: product.category?.name },
                { label: "Marca", value: product.brand?.name },
                {
                  label: "Unidad de Medida",
                  value: product.unit_of_measure?.name,
                },
                {
                  label: "Precio Compra",
                  value: `$ ${product.purchase_price}`,
                },
                { label: "Precio Venta", value: `$ ${product.sale_price}` },

                { label: "Stock Actual", value: product.current_quantity },
                { label: "Stock Mínimo", value: product.min_stock },
                { label: "Stock Máximo", value: product.max_stock },
                {
                  label: "Ubicación Almacén",
                  value: product.locality?.name || "N/A",
                },
              ].map(({ label, value }, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4"
                >
                  <h3 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                    {label}
                  </h3>
                  <p className="text-base text-neutral-900 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}

              <div className="sm:col-span-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                <h3 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                  Descripción
                </h3>
                <p className="text-base text-neutral-900 dark:text-white whitespace-pre-line">
                  {product.description?.trim() || "Sin descripción"}
                </p>
              </div>

              <div className="sm:col-span-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                <h3 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                  Notas
                </h3>
                <p className="text-base text-neutral-900 dark:text-white whitespace-pre-line">
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
