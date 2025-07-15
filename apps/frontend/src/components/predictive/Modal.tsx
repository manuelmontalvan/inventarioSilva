"use client";

import React from "react";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function SimpleModal({
  isOpen,
  onClose,
  title,
  children,
}: SimpleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur bg-opacity-30 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
        <button
          className="absolute top-2 right-3 text-gray-700 dark:text-gray-300 text-xl font-bold"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {title && (
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {title}
          </h2>
        )}
        <div className="overflow-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
}
