import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onChange: (value: string) => void;
  searchResults: any[];
  onSelect: (item: any) => void;
}

export default function SearchBar({ searchTerm, onChange, searchResults, onSelect }: SearchBarProps) {
  return (
    <div className="space-y-2 relative">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar producto por nombre (histórico de ventas)"
          className="w-full border rounded pl-10 pr-3 py-2"
          value={searchTerm}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {searchResults.length > 0 && (
        <ul className="border rounded bg-white dark:bg-gray-800 max-h-40 overflow-auto z-10 absolute w-full">
          {searchResults.map((item, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(item)}
            >
              {item.product_name} — {item.brands.join(", ")} ({item.units.join(", ")})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
