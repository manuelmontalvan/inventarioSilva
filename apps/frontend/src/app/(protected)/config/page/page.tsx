"use client";

import React, { useState, useEffect } from "react";
import {
  getPages,
  createPage,
  updatePage,
  deletePage,
} from "@/lib/api/config/page";
import { Page } from "@/types/page";
import { Button } from "@heroui/button";
import ConfirmModal from "@/components/confirmModal";
import { addToast } from "@heroui/toast";
import { PageDrawer } from "@/components/page/pageDrawer";
import ProtectedRoute from "@/components/restricted/protectedRoute";

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getPages();
      setPages(data);
    } catch {
      addToast({ title: "Error cargando páginas", color: "danger" });
    }
  }

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(pg: Page) {
    setEditing(pg);
    setDrawerOpen(true);
  }
  function close() {
    setEditing(null);
    setDrawerOpen(false);
  }

  async function handleSave(name: string, path: string) {
    try {
      let saved: Page;
      if (editing) {
        saved = await updatePage(editing.id, { name, path });
        setPages((p) => p.map((x) => (x.id === saved.id ? saved : x)));
        addToast({ title: "Página actualizada", color: "success" });
      } else {
        saved = await createPage({ name, path });
        setPages((p) => [...p, saved]);
        addToast({ title: "Página creada", color: "success" });
      }
      close();
    } catch (e: any) {
      addToast({
        title: "Error guardando página",
        description: e.message,
        color: "danger",
      });
    }
  }

  function askDelete(id: string) {
    setSelId(id);
    setModalOpen(true);
  }
  async function confirmDelete() {
    if (!selId) return;
    try {
      await deletePage(selId);
      setPages((p) => p.filter((x) => x.id !== selId));
      addToast({ title: "Página eliminada", color: "success" });
    } catch (e: any) {
      addToast({
        title: "Error eliminando",
        description: e.message,
        color: "danger",
      });
    } finally {
      setModalOpen(false);
      setSelId(null);
    }
  }

  return (
    <ProtectedRoute>
      <main className="p-6 bg-gray-50 dark:bg-gray-900 dark:text-white min-h-screen">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Páginas</h1>
          <Button color="success" variant="bordered" onPress={openCreate}>
            + Nueva Página
          </Button>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full border text-left">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-2">Página</th>
                <th className="p-2">Ruta</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((pg) => (
                <tr
                  key={pg.id}
                  className="even:bg-gray-100 dark:even:bg-gray-800"
                >
                  <td className="p-2">{pg.name}</td>
                  <td className="p-2">{pg.path}</td>
                  <td className="p-2 flex justify-center space-x-2">
                    <Button
                      color="success"
                      variant="bordered"
                      onPress={() => openEdit(pg)}
                    >
                      Editar
                    </Button>
                    <Button
                      color="danger"
                      variant="bordered"
                      onPress={() => askDelete(pg.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    No hay páginas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Drawer */}
        {drawerOpen && (
          <PageDrawer
            isOpen
            onClose={close}
            initialData={editing}
            onSave={handleSave}
          />
        )}

        <ConfirmModal
          isOpen={modalOpen}
          title="¿Eliminar página?"
          message="Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setModalOpen(false)}
        />
      </main>
    </ProtectedRoute>
  );
}
