"use client";

import React, { useRef, useEffect, useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onChange: (value: string) => void;
  searchResults: any[];
  onSelect: (item: any) => void;
}

export default function SearchBar({
  searchTerm,
  onChange,
  searchResults,
  onSelect,
}: SearchBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar lista si clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar producto por nombre (histórico de ventas)"
          className="w-full border border-gray-300 dark:border-gray-600 rounded pl-10 pr-3 py-2 bg-white dark:bg-gray-900 text-sm dark:text-white"
          value={searchTerm}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {          
             setShowDropdown(searchResults.length > 0);           
          }}
        />
        {/* Botón de limpiar */}
        {searchTerm && (
          <button
            type="button"
            className="absolute right-2 top-2.5  text-red-600 hover:text-gray-600 dark:hover:text-white focus:outline-none"
            onClick={() => {
              onChange(""); // limpia el texto
              setShowDropdown(true); // muestra dropdown con todos los resultados (si existen)
            }}
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="absolute w-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:text-white dark:border-gray-600 rounded shadow-md max-h-60 overflow-y-auto text-sm custom-scroll">
          {searchResults.length > 0 ? (
            searchResults.map((item, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  onSelect(item);
                  setShowDropdown(false);
                }}
              >
                <span className="font-medium">{item.product_name}</span>
                <span className="text-xs text-gray-500">
                  {" "}
                  — {item.brands.join(", ")} ({item.units.join(", ")})
                </span>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400 italic">
              No se encontraron resultados
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
