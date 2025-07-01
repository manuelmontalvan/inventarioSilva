import { Role } from "@/types/role";
import { Page } from "@/types/page";
import { useState, useEffect } from "react";
import { Button } from "@heroui/button";

interface RoleDrawerProps {
  isOpen: boolean;
  onClose(): void;
  onSave(name: string, pageIds: string[]): void;
  initialData: Role | null;
  allPages: Page[];
}
export function RoleDrawer({ isOpen, onClose, onSave, initialData, allPages }: RoleDrawerProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelected(initialData.pages?.map(p => p.id) || []);
    } else {
      setName("");
      setSelected([]);
    }
  }, [initialData, isOpen]);

  const toggle = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 w-full max-w-sm h-full bg-white dark:bg-gray-900 z-50 p-6 overflow-auto">
        <Button onPress={onClose} variant="bordered" color="default">× Cerrar</Button>
        <h2 className="text-xl font-bold mt-4">{initialData ? "Editar rol" : "Crear rol"}</h2>
        <input value={name} onChange={e => setName(e.target.value)} className="mt-2 p-2 border rounded w-full" placeholder="Nombre del rol" autoFocus />
        <div className="mt-4">
          <p className="font-medium">Asignar páginas</p>
          <div className="max-h-48 overflow-y-auto border rounded p-2 mt-2">
            {allPages.map(p => (
              <label key={p.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggle(p.id)}
                  className="mr-2"
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
        <Button
          className="mt-4"
          onPress={() => name.trim() && onSave(name.trim(), selected)}
          variant="bordered"
          color="success"
        >
          Guardar
        </Button>
      </aside>
    </>
  );
}
