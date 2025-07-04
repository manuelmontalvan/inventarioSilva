import React from "react";

interface ProductSelectorsProps {
  brands: string[];
  units: string[];
  selectedBrand: string;
  selectedUnit: string;
  onBrandChange: (value: string) => void;
  onUnitChange: (value: string) => void;
}

export default function ProductSelectors({
  brands,
  units,
  selectedBrand,
  selectedUnit,
  onBrandChange,
  onUnitChange,
}: ProductSelectorsProps) {
  return (
    <div className="flex flex-col gap-2 max-w-xs mt-4">
      <label htmlFor="brand-select" className="font-medium text-gray-700 dark:text-gray-300">
        Selecciona Marca
      </label>
      <select
        id="brand-select"
        value={selectedBrand}
        onChange={(e) => onBrandChange(e.target.value)}
        className="border rounded px-3 py-2"
      >
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <label htmlFor="unit-select" className="font-medium text-gray-700 dark:text-gray-300 mt-4">
        Selecciona Unidad
      </label>
      <select
        id="unit-select"
        value={selectedUnit}
        onChange={(e) => onUnitChange(e.target.value)}
        className="border rounded px-3 py-2"
      >
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  );
}
