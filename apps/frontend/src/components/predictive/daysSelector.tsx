import React from "react";

interface DaysSelectorProps {
  days: number;
  onChange: (value: number) => void;
}

export default function DaysSelector({ days, onChange }: DaysSelectorProps) {
  return (
    <div className="flex gap-4 items-center mt-6 max-w-xs">
      <label className="text-sm text-gray-700 dark:text-gray-300">Días a predecir:</label>
      <input
        type="number"
        min={1}
        max={30}
        value={days}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border rounded px-3 py-2 w-24"
      />
    </div>
  );
}
