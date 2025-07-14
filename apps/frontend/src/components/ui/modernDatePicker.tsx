// components/ui/ModernDatePicker.tsx
"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { useState } from "react";

interface Props {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function ModernDatePicker({ date, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-full flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-left"
        >
          <span>{date ? dayjs(date).format("YYYY-MM-DD") : "Selecciona una fecha (opcional)"}</span>
          <CalendarIcon className="h-4 w-4 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 z-50">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
