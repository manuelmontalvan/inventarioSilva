"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import React, { useState, useEffect } from "react";
import {
  Category,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/products/categories";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import ConfirmModal from "@/components/confirmModal";

function CategoryTable({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="w-full border-collapse dark:text-white">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-700">
          <th className="p-2 border border-gray-300 dark:border-gray-600">
            Nombre
          </th>
          <th className="p-2 border border-gray-300 dark:border-gray-600">
            Descripción
          </th>
          <th className="p-2 border border-gray-300 dark:border-gray-600">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        {categories.map((cat) => (
          <tr key={cat.id} className="even:bg-gray-100 dark:even:bg-gray-800">
            <td className="p-2 border border-gray-300 dark:border-gray-600">
              {cat.name}
            </td>
            <td className="p-2 border border-gray-300 dark:border-gray-600">
              {cat.description || "-"}
            </td>
            <td className="p-2 border border-gray-300 dark:border-gray-600 space-x-2">
              <Button
                color="success"
                variant="bordered"
                onPress={() => onEdit(cat)}
              >
                Editar
              </Button>
              <Button
                onPress={() => onDelete(cat.id)}
                color="danger"
                variant="bordered"
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

function CategoryDrawer({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  initialData: Category | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es obligatorio");
    onSave(name.trim(), description.trim());
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
        <Button onPress={onClose} color="danger" variant="bordered">
          Cerrar ×
        </Button>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <h2 className="text-xl   p-2 font-bold text-gray-900 dark:text-white">
            {initialData ? "Editar Categoría" : "Crear Categoría"}
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
              Descripción
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      alert("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (name: string, description?: string) => {
    setLoading(true);
    try {
      if (editCategory) {
        // Editar
        await updateCategory(editCategory.id, { name, description });
        addToast({
          title: "Categoría actualizada",
          description: `La categoría "${name}" ha sido actualizada correctamente.`,
          color: "success",
          variant: "bordered",
        });
      } else {
        // Crear
        await createCategory({ name, description });
        addToast({
          title: "Categoría Creada",
          description: `La categoría "${name}" ha sido creada correctamente.`,
          color: "success",
          variant: "bordered",
        });
      }
      await loadCategories();
      setDrawerOpen(false);
      setEditCategory(null);
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo guardar la categoría. Inténtalo de nuevo.",
        color: "danger",
        variant: "bordered",
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
      await deleteCategory(selectedId);
      setCategories((prev) => prev.filter((s) => s.id !== selectedId));
      addToast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente.",
        color: "success",
        variant: "bordered",
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

  const openEditDrawer = (cat: Category) => {
    setEditCategory(cat);
    setDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setEditCategory(null);
    setDrawerOpen(true);
  };

  return (
  <ProtectedRoute>
    <main className="p-6 min-h-screen dark:text-white bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="flex flex-row sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold mb-6">Gestion Categorías</h1>

        <Button onPress={openCreateDrawer} color="success" variant="bordered">
          + Nueva Categoría
        </Button>
      </header>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={openEditDrawer}
          onDelete={handleDeleteClick}
        />
      )}

      <CategoryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        initialData={editCategory}
      />
       <ConfirmModal
              isOpen={modalOpen}
              title="¿Eliminar Categoria?"
              message="Esta acción no se puede deshacer."
              onConfirm={handleDeleteConfirmed}
              onCancel={() => setModalOpen(false)}
            />
    </main>
  </ProtectedRoute>
  );
}
