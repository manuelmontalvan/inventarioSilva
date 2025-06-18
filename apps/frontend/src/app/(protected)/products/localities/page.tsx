"use client";

import React, { useState, useEffect } from "react";
import {
  Locality,
  Category,
  getLocalities,
  createLocality,
  updateLocality,
  deleteLocality,
  getCategories,
} from "@/lib/api/products/localities";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import ConfirmModal from "@/components/confirmModal";

function LocalityTable({
  localities,
  onEdit,
  onDelete,
}: {
  localities: Locality[];
  onEdit: (locality: Locality) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse dark:text-white">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 ">
            <th className="p-2 border border-gray-300 dark:border-gray-600 text-left">
              Nombre
            </th>
            <th className="p-2 border border-gray-300 dark:border-gray-600 text-left">
              Categoria
            </th>
            <th className="p-2 border border-gray-300 dark:border-gray-600 text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {localities.map((locality) => (
            <tr
              key={locality.id}
              className="even:bg-gray-100 dark:even:bg-gray-800"
            >
              <td className="p-2 border border-gray-300 dark:border-gray-600">
                {locality.name}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600">
                {locality.category?.name || "-"}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 space-x-2 flex justify-center">
                <Button
                  onPress={() => onEdit(locality)}
                  color="success"
                  variant="bordered"
                >
                  Edit
                </Button>
                <Button
                  onPress={() => onDelete(locality.id)}
                  color="danger"
                  variant="bordered"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {localities.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="p-4 text-center text-gray-500 dark:text-gray-400"
              >
                No localities to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LocalityDrawer({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, categoryId: string) => void;
  initialData: Locality | null;
  categories: Category[];
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategoryId(initialData.category?.id || "");
    } else {
      setName("");
      setCategoryId("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required");
    if (!categoryId) return alert("Category is required");
    onSave(name.trim(), categoryId);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-opacity-30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="
          fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-lg p-6 overflow-auto z-50
          w-full max-w-xs sm:max-w-sm transition-transform
        "
      >
        <Button
          className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onPress={onClose}
          aria-label="Close panel"
          variant="bordered"
          color="danger"
        >
          × Close
        </Button>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Edit Locality" : "Create Locality"}
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

          <label className="flex flex-col">
            <span className="mb-1 text-gray-700 dark:text-gray-300">
              Categoria
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="" disabled>
                seleccionar una categoria
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" color="success" variant="bordered">
            Save
          </Button>
        </form>
      </aside>
    </>
  );
}

export default function LocalitiesPage() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [loading, setLoading] = useState(false);

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [localitiesData, categoriesData] = await Promise.all([
        getLocalities(),
        getCategories(),
      ]);
      setLocalities(localitiesData);
      setCategories(categoriesData);
    } catch (error) {
      addToast({
        title: "Error loading data",
        description: "Could not load localities or categories.",
        color: "danger",
        timeout: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingLocality(null);
    setDrawerOpen(true);
  }

  function openEdit(locality: Locality) {
    setEditingLocality(locality);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingLocality(null);
  }

  async function handleSave(name: string, categoryId: string) {
    try {
      if (editingLocality) {
        // Update
        const updated = await updateLocality(editingLocality.id, {
          name,
          categoryId,
        });
        setLocalities((prev) =>
          prev.map((loc) => (loc.id === updated.id ? updated : loc))
        );
        addToast({
          title: "Localidad actualizada",
          color: "success",
          variant: "bordered",
        });
      } else {
        // Create
        const created = await createLocality({ name, categoryId });
        setLocalities((prev) => [...prev, created]);
        addToast({
          title: "Localidad creada",
          color: "success",
          variant: "bordered",
        });
      }
      closeDrawer();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Falla al guardar localidad.",
        color: "danger",
        variant: "bordered",
      });
    }
  }

  function handleDeleteClick(id: string) {
    setIdToDelete(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!idToDelete) return;
    try {
      await deleteLocality(idToDelete);
      setLocalities((prev) => prev.filter((loc) => loc.id !== idToDelete));
      addToast({
        title: "Localidad Eliminada",
        color: "success",
        variant: "bordered",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Fallo al eliminar localidad.",
        color: "danger",
        variant: "bordered",
      });
    } finally {
      setConfirmOpen(false);
      setIdToDelete(null);
    }
  }

  function cancelDelete() {
    setConfirmOpen(false);
    setIdToDelete(null);
  }

  return (
    <main className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors">
      <header className="flex flex-row sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Localidad</h1>

        <Button
          color="success"
          variant="bordered"
          onPress={openCreate}
          className="mb-4"
        >
          + Create Locality
        </Button>
      </header>

      {loading ? (
        <p className="dark:text-white">Loading...</p>
      ) : (
        <LocalityTable
          localities={localities}
          onEdit={openEdit}
          onDelete={handleDeleteClick}
        />
      )}

      <LocalityDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave}
        initialData={editingLocality}
        categories={categories}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title="¿Eliminar Localidad?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </main>
  );
}
