// src/components/ui/ExportDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";

interface ExportDropdownProps {
  onExportAllPdf: () => void;
  onExportAllExcel: () => void;
  onExportAllCsv: () => void;

  onExportSelectedPdf: () => void;
  onExportSelectedExcel: () => void;
  onExportSelectedCsv: () => void;

  multipleSelected: boolean;
}

export default function ExportDropdown({
  onExportAllPdf,
  onExportAllExcel,
  onExportAllCsv,
  onExportSelectedPdf,
  onExportSelectedExcel,
  onExportSelectedCsv,
  multipleSelected,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Exportar ▼
      </button>

      {open && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
        >
          <div className="py-1" role="none">
            {multipleSelected ? (
              <>
                <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  Órdenes seleccionadas
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 cursor-pointer"
                  role="menuitem"
                  onClick={() => {
                    onExportSelectedPdf();
                    setOpen(false);
                  }}
                >
                  PDF
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-green-600 hover:text-white dark:hover:bg-green-500 cursor-pointer"
                  role="menuitem"
                  onClick={() => {
                    onExportSelectedExcel();
                    setOpen(false);
                  }}
                >
                  Excel
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-yellow-600 hover:text-white dark:hover:bg-yellow-500 cursor-pointer"
                  role="menuitem"
                  onClick={() => {
                    onExportSelectedCsv();
                    setOpen(false);
                  }}
                >
                  CSV
                </button>
              </>
            ) : (
              <>
                <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  Todas las órdenes
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 cursor-pointer"
                  role="menuitem"
                  onClick={() => {
                    onExportAllPdf();
                    setOpen(false);
                  }}
                >
                  PDF
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-green-600 hover:text-white dark:hover:bg-green-500 cursor-pointer"
                  role="menuitem"
                  onClick={() => {
                    onExportAllExcel();
                    setOpen(false);
                  }}
                >
                  Excel
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-yellow-600 hover:text-white dark:hover:bg-yellow-500 cursor-pointer"
                  role="menuitem"
                  onClick={() => {
                    onExportAllCsv();
                    setOpen(false);
                  }}
                >
                  CSV
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
