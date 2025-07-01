"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import {
  getLocalities,
  createLocality,
  deleteLocality,
   getShelvesByLocality,
  createShelf,
  deleteShelf,
} from "@/lib/api/products/localities";
import { getCategories } from "@/lib/api/products/categories";

interface Locality {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Shelf {
  id: string;
  name: string;
  category: Category;
  localityId: string;
}

export default function LocalityShelfManager() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>("");
  const [shelves, setShelves] = useState<Shelf[]>([]);

  const [drawerLocalityOpen, setDrawerLocalityOpen] = useState(false);
  const [drawerShelfOpen, setDrawerShelfOpen] = useState(false);

  const [localityName, setLocalityName] = useState("");
  const [shelfName, setShelfName] = useState("");
  const [shelfLocalityId, setShelfLocalityId] = useState<string>("");
  const [shelfCategoryId, setShelfCategoryId] = useState<string>("");

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedLocalityId) loadShelves(selectedLocalityId);
    else setShelves([]);
  }, [selectedLocalityId]);

  async function loadInitial() {
    try {
      const [locs, cats] = await Promise.all([
        getLocalities(),
        getCategories(),
      ]);
      setLocalities(locs);
      setCategories(cats);
      if (locs.length) setSelectedLocalityId(locs[0].id);
    } catch {
      addToast({ title: "Error", description: "Falló carga inicial", color: "danger" });
    }
  }

  async function loadShelves(localityId: string) {
    try {
      const sh = await getShelvesByLocality(localityId);
      setShelves(sh);
    } catch {
      addToast({ title: "Error", description: "Falló carga perchas", color: "danger" });
    }
  }

  async function handleCreateLocality() {
    if (!localityName.trim()) return;
    try {
      const newLoc = await createLocality({ name: localityName });
      setLocalities(prev => [...prev, newLoc]);
      setLocalityName("");
      setDrawerLocalityOpen(false);
      addToast({ title: "Éxito", description: "Localidad creada", color: "success" });
    } catch {
      addToast({ title: "Error", description: "No se pudo crear localidad", color: "danger" });
    }
  }

  async function handleDeleteLocality(id: string) {
    if (!confirm("¿Eliminar localidad?")) return;
    try {
      await deleteLocality(id);
      setLocalities(prev => prev.filter(l => l.id !== id));
      addToast({ title: "Éxito", description: "Localidad eliminada", color: "success" });
    } catch {
      addToast({ title: "Error", description: "No se pudo eliminar localidad", color: "danger" });
    }
  }

  async function handleCreateShelf() {
    if (!shelfName.trim() || !shelfLocalityId || !shelfCategoryId) return;
    try {
      const newSh = await createShelf({
        name: shelfName,
        localityId: shelfLocalityId,
        categoryId: shelfCategoryId,
      });
      if (shelfLocalityId === selectedLocalityId) {
        setShelves(prev => [...prev, newSh]);
      }
      setShelfName("");
      setShelfLocalityId("");
      setShelfCategoryId("");
      setDrawerShelfOpen(false);
      addToast({ title: "Éxito", description: "Percha creada", color: "success" });
    } catch {
      addToast({ title: "Error", description: "No se pudo crear percha", color: "danger" });
    }
  }

  async function handleDeleteShelf(id: string) {
    if (!confirm("¿Eliminar percha?")) return;
    try {
      await deleteShelf(id);
      setShelves(prev => prev.filter(s => s.id !== id));
      addToast({ title: "Éxito", description: "Percha eliminada", color: "success" });
    } catch {
      addToast({ title: "Error", description: "No se pudo eliminar percha", color: "danger" });
    }
  }

  return (
    <ProtectedRoute>
    <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Localidades & Perchas</h1>
        <div className="space-x-2">
          <Button onPress={() => setDrawerLocalityOpen(true)} variant="bordered" color="success" >
            Crear Localidad
          </Button>
          <Button onPress={() => setDrawerShelfOpen(true)} variant="bordered" color="success" >
            Crear Percha
          </Button>
        </div>
      </header>

      {/* Localidades Table */}
      <section className="mb-8">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {localities.map(loc => (
              <tr key={loc.id} className="even:bg-gray-100 dark:even:bg-gray-700">
                <td className="p-3">{loc.name}</td>
                <td className="p-3 text-center space-x-2">
                  <Button onPress={() => handleDeleteLocality(loc.id)} variant="ghost" color="danger" >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Selector Localidad */}
      <label className="block mb-4 dark:text-white">
        Mostrar Perchas de:
        <select
          value={selectedLocalityId}
          onChange={e => setSelectedLocalityId(e.target.value)}
          className="ml-2 p-2 border rounded"
        >
          {localities.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </label>

      {/* Shelves Table */}
      <section>
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Nombre Percha</th>
              <th className="p-3 text-left">Categoría</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {shelves.map(sh => (
              <tr key={sh.id} className="even:bg-gray-100 dark:even:bg-gray-700">
                <td className="p-3">{sh.name}</td>
                <td className="p-3">{sh.category.name}</td>
                <td className="p-3 text-center">
                  <Button onPress={() => handleDeleteShelf(sh.id)} variant="ghost" color="danger" >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Drawers */}
      {drawerLocalityOpen && (
        <aside className="fixed inset-0 flex justify-end z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setDrawerLocalityOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 p-6 grid gap-4 shadow-xl">
            <h2 className="text-xl font-semibold">Crear Localidad</h2>
            <input
              value={localityName}
              onChange={e => setLocalityName(e.target.value)}
              placeholder="Nombre"
              className="p-2 border rounded"
              autoFocus
            />
            <Button onPress={handleCreateLocality} variant="solid" color="primary" >
              Guardar
            </Button>
          </div>
        </aside>
      )}

      {drawerShelfOpen && (
        <aside className="fixed inset-0 flex justify-end z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setDrawerShelfOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 p-6 grid gap-4 shadow-xl">
            <h2 className="text-xl font-semibold">Crear Percha</h2>
            <input
              value={shelfName}
              onChange={e => setShelfName(e.target.value)}
              placeholder="Nombre"
              className="p-2 border rounded"
              autoFocus
            />
            <select
              value={shelfLocalityId}
              onChange={e => setShelfLocalityId(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Selecciona Localidad</option>
              {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select
              value={shelfCategoryId}
              onChange={e => setShelfCategoryId(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Selecciona Categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button onPress={handleCreateShelf} variant="solid" color="primary" >
              Guardar
            </Button>
          </div>
        </aside>
      )}
    </main>
    </ProtectedRoute>
  );
}
