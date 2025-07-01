"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/products/categories";
import {
  getMargins,
  createMargin,
  deleteMargin,
  getTaxes,
  createTax,
  deleteTax,
} from "@/lib/api/config/marginTax";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { addToast } from "@heroui/toast";
import { Combobox } from "@/components/ui/combobox";

interface Category {
  id: string;
  name: string;
}

interface MarginConfig {
  id: string;
  percentage: number;
  category?: Category | null;
}

interface Tax {
  id: string;
  name: string;
  rate: number;
}

export default function MarginAndTaxConfigPage() {
  const [margins, setMargins] = useState<MarginConfig[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newMargin, setNewMargin] = useState<{
    categoryId: string;
    percentage: string;
  }>({
    categoryId: "",
    percentage: "",
  });
  const [newTax, setNewTax] = useState<{ name: string; rate: string }>({
    name: "",
    rate: "",
  });

  useEffect(() => {
    async function fetchData() {
      const [marginData, taxData, categoryData] = await Promise.all([
        getMargins(),
        getTaxes(),
        getCategories(),
      ]);
      setMargins(marginData);
      setTaxes(taxData);
      setCategories(categoryData);
    }
    fetchData();
  }, []);

  const handleAddMargin = async () => {
    try {
      if (!newMargin.percentage.trim()) {
        addToast({ title: "El porcentaje es obligatorio", color: "warning" });
        return;
      }
      const created = await createMargin({
        categoryId: newMargin.categoryId === "" ? null : newMargin.categoryId,
        percentage: parseFloat(newMargin.percentage),
      });
      setMargins((prev) => [...prev, created]);
      setNewMargin({ categoryId: "", percentage: "" });
      addToast({ title: "Margen agregado", color: "success" });
    } catch {
      addToast({ title: "Error al agregar margen", color: "danger" });
    }
  };

  const handleDeleteMargin = async (id: string) => {
    await deleteMargin(id);
    setMargins((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddTax = async () => {
    try {
      if (!newTax.name.trim() || !newTax.rate.trim()) {
        addToast({ title: "Nombre y tasa son obligatorios", color: "warning" });
        return;
      }
      const created = await createTax({
        name: newTax.name,
        rate: parseFloat(newTax.rate),
      });
      setTaxes((prev) => [...prev, created]);
      setNewTax({ name: "", rate: "" });
      addToast({ title: "Impuesto agregado", color: "success" });
    } catch {
      addToast({ title: "Error al agregar impuesto", color: "danger" });
    }
  };

  const handleDeleteTax = async (id: string) => {
    await deleteTax(id);
    setTaxes((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold">
          Configuración de Margen e Impuestos
        </h1>

        {/* MÁRGENES */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Márgenes de ganancia</h2>

            <div className="flex gap-2">
              <Combobox
                items={[
                  { label: "Global", value: "" },
                  ...categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  })),
                ]}
                value={newMargin.categoryId}
                onChange={(val) =>
                  setNewMargin((prev) => ({ ...prev, categoryId: val ?? "" }))
                }
                placeholder="Seleccione una categoría"
              />

              <Input
                type="number"
                placeholder="%"
                value={newMargin.percentage}
                onFocus={() =>
                  setNewMargin((prev) => ({ ...prev, percentage: "" }))
                }
                onChange={(e) =>
                  setNewMargin((prev) => ({
                    ...prev,
                    percentage: e.target.value,
                  }))
                }
              />

              <Button onClick={handleAddMargin}>Agregar</Button>
            </div>

            <ul className="space-y-2">
              {margins.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between border p-2 rounded"
                >
                  <span>
                    {m.category?.name ?? "Global"}: {m.percentage}%
                  </span>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMargin(m.id)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* IMPUESTOS */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Impuestos</h2>

            <div className="flex gap-2">
              <Input
                placeholder="Nombre"
                value={newTax.name}
                onChange={(e) =>
                  setNewTax((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                type="number"
                placeholder="%"
                value={newTax.rate}
                onFocus={() => setNewTax((prev) => ({ ...prev, rate: "" }))}
                onChange={(e) =>
                  setNewTax((prev) => ({ ...prev, rate: e.target.value }))
                }
              />
              <Button onClick={handleAddTax}>Agregar</Button>
            </div>

            <ul className="space-y-2">
              {taxes.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between border p-2 rounded"
                >
                  <span>
                    {t.name}: {t.rate}%
                  </span>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTax(t.id)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
