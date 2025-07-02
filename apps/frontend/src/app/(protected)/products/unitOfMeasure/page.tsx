"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import React, { useState, useEffect } from "react";
import {
  UnitOfMeasure,
  getUnitsOfMeasure,
  createUnitOfMeasure,
  updateUnitOfMeasure,
  deleteUnitOfMeasure,
} from "@/lib/api/products/unitOfMeasures";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import ConfirmModal  from "@/components/confirmModal";

function UnitTable({
  units,
  onEdit,
  onDelete,
}: {
  units: UnitOfMeasure[];
  onEdit: (unit: UnitOfMeasure) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-700">
          <th className="p-2 border border-gray-300 dark:border-gray-600">
            Nombre
          </th>
          <th className="p-2 border border-gray-300 dark:border-gray-600">
            Abreviatura
          </th>
          <th className="p-2 border border-gray-300 dark:border-gray-600">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        {units.map((unit) => (
          <tr key={unit.id} className="even:bg-gray-100 dark:even:bg-gray-800">
            <td className="p-2 border border-gray-300 dark:border-gray-600">
              {unit.name}
            </td>
            <td className="p-2 border border-gray-300 dark:border-gray-600">
              {unit.abbreviation}
            </td>
            <td className="p-2 border border-gray-300 dark:border-gray-600 space-x-2 justify-center">
              <Button
                onPress={() => onEdit(unit)}
                color="success"
                variant="bordered"
              >
                Editar
              </Button>
              <Button
                color="danger"
                variant="bordered"
                onPress={() => onDelete(unit.id)}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UnitDrawer({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, abbreviation: string) => void;
  initialData: UnitOfMeasure | null;
}) {
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAbbreviation(initialData.abbreviation);
    } else {
      setName("");
      setAbbreviation("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !abbreviation.trim())
      return alert("Nombre y abreviatura son obligatorios");
    onSave(name.trim(), abbreviation.trim());
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0  bg-opacity-30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed top-0 right-0 w-96 h-full bg-white dark:bg-gray-900 shadow-lg p-6 overflow-auto z-50 transition-transform transform">
        <Button color="danger" variant="bordered" onPress={onClose}>
          Cerrar ×
        </Button>

        <form onSubmit={handleSubmit} className="flex p-2 flex-col space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Editar Unidad de Medida" : "Crear Unidad de Medida"}
          </h2>

          <label className="flex flex-col">
            <span className="mb-1 text-gray-700 dark:text-gray-300">
              Nombre
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-gray-700 dark:text-gray-300">
              Abreviatura
            </span>
            <input
              type="text"
              value={abbreviation}
              onChange={(e) => setAbbreviation(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </label>

          <Button type="submit" color="success" variant="bordered">
            Guardar
          </Button>
        </form>
      </aside>
    </>
  );
}


export default function UnitOfMeasurePage() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<UnitOfMeasure | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const data = await getUnitsOfMeasure();
      setUnits(data);
    } catch (error: unknown) {
      let description = "No se pudieron cargar las unidades de medida.";
      if (
        typeof error === "object" &&
        error &&
        "response" in error &&
        (error as any).response?.data?.message
      ) {
        description = (error as any).response.data.message;
      }

      console.error("Error cargando unidades de medida:", error);
      addToast({
        title: "Error",
        description,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (name: string, abbreviation: string) => {
    setLoading(true);
    try {
      if (editUnit) {
        await updateUnitOfMeasure(editUnit.id, { name, abbreviation });
        addToast({
          title: "Unidad de medida actualizada",
          color: "success",
          variant: "bordered",
        });
      } else {
        await createUnitOfMeasure({ name, abbreviation });
        addToast({
          title: "Unidad de medida creada",
          color: "success",
          variant: "bordered",
        });
      }
      await loadUnits();
      setDrawerOpen(false);
      setEditUnit(null);
    } catch (error: unknown) {
      addToast({
        title: "No se pudo crear unidad de medida",
        description: "Error al crear unidad de medida",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  function handleDeleteClick(id: string) {
    setSelectedId(id);
    setModalOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedId) return;
    setLoading(true);
    try {
      await deleteUnitOfMeasure(selectedId);
      setUnits((prev) => prev.filter((s) => s.id !== selectedId));
      addToast({
        title: "Unidad de medida eliminada",
        color: "danger",
        variant: "bordered",
      });
    } catch (error: unknown) {
      const backendMessage =
        typeof error === "object" &&
        error &&
        "response" in error &&
        (error as any).response?.data?.message;

      addToast({
        title: "Error eliminando Unidad de Medida",
        description: backendMessage || "Error desconocido",
        variant: "bordered",
        color: "danger",
      });
    } finally {
      setLoading(false);
      setModalOpen(false);
      setSelectedId(null);
    }
  }

  const openEditDrawer = (unit: UnitOfMeasure) => {
    setEditUnit(unit);
    setDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setEditUnit(null);
    setDrawerOpen(true);
  };

  return (
    <ProtectedRoute>
      <main className="p-6 min-h-screen bg-gray-50 dark:text-white dark:bg-gray-900 transition-colors">
        <header className="flex flex-row sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold mb-6">Unidades de Medida</h1>
          <Button onPress={openCreateDrawer} color="success" variant="bordered">
            Nueva Unidad de Medida
          </Button>
        </header>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <UnitTable
            units={units}
            onEdit={openEditDrawer}
            onDelete={handleDeleteClick}
          />
        )}

        <UnitDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSave={handleSave}
          initialData={editUnit}
        />

        <ConfirmModal
          isOpen={modalOpen}
          title="¿Eliminar Unidad de Medida?"
          message="Esta acción no se puede deshacer."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setModalOpen(false)}
        />
      </main>
    </ProtectedRoute>
  );
}
