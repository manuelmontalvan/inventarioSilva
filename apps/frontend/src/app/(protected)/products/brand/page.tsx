"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";

import React, { useState, useEffect } from "react";
import {
  Brand,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/api/products/brands";
import { Button } from "@heroui/button";
import ConfirmModal from "@/components/confirmModal";
import { addToast } from "@heroui/toast";
function BrandTable({
  brands,
  onEdit,
  onDelete,
}: {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}) {
  return (
   


    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse dark:text-white">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 ">
            <th className="p-2 border border-gray-300 dark:border-gray-600 text-left  ">
              Nombre
            </th>
            <th className="p-2 border border-gray-300 dark:border-gray-600 text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr
              key={brand.id}
              className="even:bg-gray-100 dark:even:bg-gray-800"
            >
              <td className="p-2 border border-gray-300 dark:border-gray-600">
                {brand.name}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 space-x-2  flex justify-center ">
                <Button
                  onPress={() => onEdit(brand)}
                  color="success"
                  variant="bordered"
                >
                  Editar
                </Button>
                <Button
                  color="danger"
                  variant="bordered"
                  onPress={() => onDelete(brand.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
          {brands.length === 0 && (
            <tr>
              <td
                colSpan={2}
                className="p-4 text-center text-gray-500 dark:text-gray-400"
              >
                No hay marcas para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BrandDrawer({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialData: Brand | null;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es obligatorio");
    onSave(name.trim());
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0  bg-opacity-30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="
          fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-lg p-6 overflow-auto z-50
          w-full max-w-xs
          sm:max-w-sm
          transition-transform
          "
      >
        <Button
          className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onPress={onClose}
          aria-label="Cerrar panel"
          variant="bordered"
          color="default"
        >
          × Cerrar
        </Button>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Editar Marca" : "Crear Marca"}
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
              autoFocus
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

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      alert("Error cargando marcas");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingBrand(null);
    setDrawerOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditingBrand(brand);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingBrand(null);
  }

  async function handleSave(name: string) {
    setLoading(true);
    try {
      if (editingBrand) {
        const updated = await updateBrand(editingBrand.id, { name });
        setBrands((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
        addToast({
          title: "Marca  Actualizada",
          color: "success",
          variant: "bordered",
        });
      } else {
        const created = await createBrand({ name });
        setBrands((prev) => [...prev, created]);
        addToast({
          title: "Marca Creada",
          color: "success",
          variant: "bordered",
        });
      }
      closeDrawer();
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error al guardar la marca",
        color: "danger",
        variant: "bordered",
      });
    } finally {
      setLoading(false);
    }
  }
  function handleDeleteClick(id: string) {
    setSelectedId(id);
    setModalOpen(true);
  }
  async function handleDeleteConfirmed() {
    if (!selectedId) return;
    setLoading(true);
    try {
      await deleteBrand(selectedId);
      setBrands((prev) => prev.filter((s) => s.id !== selectedId));
      addToast({
        title: "Marca eliminada",
        description: "La marca ha sido eliminada correctamente.",
        variant: "bordered",
        color: "success",
      });
    } catch (error: any) {
      // Accedemos al mensaje que viene del backend (si existe)
      const backendMessage = error?.response?.data?.message;

      addToast({
        title: "Error eliminando marca",
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

  return (
    <ProtectedRoute>
     
    <main className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors">
      <header className="flex flex-row sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Marcas
        </h1>
        <Button
          onPress={openCreate}
          disabled={loading}
          color="success"
          variant="bordered"
        >
          + Crear Marca
        </Button>
      </header>

      {loading && (
        <p className="mb-4 text-gray-700 dark:text-gray-300">Cargando...</p>
      )}

      <BrandTable
        brands={brands}
        onEdit={openEdit}
        onDelete={handleDeleteClick}
      />

      <BrandDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave}
        initialData={editingBrand}
      />
      <ConfirmModal
        isOpen={modalOpen}
        title="¿Eliminar Marca?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setModalOpen(false)}
      />
    </main>
    </ProtectedRoute>
  );
}
