// src/components/ConfirmModal.tsx
"use client";

import React from "react";
import { Button } from "@heroui/button";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
        >
          {title || "Confirmar acción"}
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {message || "¿Estás seguro?"}
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="bordered" color="default" onPress={onCancel}>
            Cancelar
          </Button>
          <Button color="danger" variant="bordered"onPress={onConfirm}>
            Borrar
          </Button>
        </div>
      </div>
    </>
  );
}
