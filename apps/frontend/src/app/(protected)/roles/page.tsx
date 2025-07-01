"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import React, { useState, useEffect } from "react";
import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} from "@/lib/api/users/role";
import { RoleDrawer } from "@/components/roles/rolesDrawer";
import { Role } from "@/types/role";
import { Page } from "@/types/page";

import { getPages } from "@/lib/api/config/page";
import { Button } from "@heroui/button";
import ConfirmModal from "@/components/confirmModal";
import { addToast } from "@heroui/toast";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [rls, pgs] = await Promise.all([getRoles(), getPages()]);
      setRoles(rls);
      setPages(pgs);
    } catch {
      addToast({ title: "Error cargando roles/páginas", color: "danger" });
    }
  }

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(role: Role) {
    setEditing(role);
    setDrawerOpen(true);
  }
  function close() {
    setDrawerOpen(false);
    setEditing(null);
  }

  async function handleSave(name: string, selectedPageIds: string[]) {
    try {
      let saved: Role;
      if (editing) {
        saved = await updateRole(editing.id, name, selectedPageIds);
        setRoles((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
        addToast({ title: "Rol actualizado", color: "success" });
      } else {
        saved = await createRole(name, selectedPageIds);
        setRoles((prev) => [...prev, saved]);
        addToast({ title: "Rol creado", color: "success" });
      }
      close();
    } catch (e: any) {
      addToast({
        title: "Error guardando rol",
        description: e.message,
        color: "danger",
      });
    }
  }

  function askDelete(id: string) {
    setSelectedId(id);
    setModalOpen(true);
  }

  async function confirmDelete() {
    if (!selectedId) return;
    try {
      await deleteRole(selectedId);
      setRoles((r) => r.filter((x) => x.id !== selectedId));
      addToast({ title: "Rol eliminado", color: "success" });
    } catch (e: any) {
      addToast({
        title: "Error eliminando rol",
        description: e.message,
        color: "danger",
      });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
    }
  }

  return (
    <ProtectedRoute>
     
    <main className="p-6 bg-gray-50 dark:bg-gray-900 dark:text-white min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Roles</h1>
        <Button color="success" variant="bordered" onPress={openCreate}>
          + Nuevo Rol
        </Button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left border">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-2">Rol</th>
              <th className="p-2">Páginas asignadas</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="even:bg-gray-100 dark:even:bg-gray-800">
                <td className="p-2">{r.name}</td>
                <td className="p-2">
                  {r.pages?.map((p) => p.name).join(", ")}
                </td>
                <td className="p-2 flex justify-center space-x-2">
                  <Button
                    color="success"
                    variant="bordered"
                    onPress={() => openEdit(r)}
                  >
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    variant="bordered"
                    onPress={() => askDelete(r.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center">
                  No hay roles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer del formulario */}
      {drawerOpen && (
        <RoleDrawer
          isOpen
          onClose={close}
          onSave={handleSave}
          initialData={editing}
          allPages={pages}
        />
      )}

      <ConfirmModal
        isOpen={modalOpen}
        title="Eliminar rol?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
      />
    </main>
    </ProtectedRoute>
  );
}
