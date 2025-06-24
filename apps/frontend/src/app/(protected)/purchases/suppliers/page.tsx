"use client";

import React, { useState,  useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Supplier,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/lib/api/purchases/suppliers";
import { Button } from "@heroui/button";
import ConfirmModal  from "@/components/confirmModal";
import { addToast } from "@heroui/toast";

// Zod schema para validar el formulario de proveedor
const SupplierSchema = z.object({
  identification: z.string().min(1, "La cedula o ruc es obligatorio"),
  name: z.string().min(1, "El nombre es obligatorio"),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  address: z.string().optional(),
});

type SupplierForm = z.infer<typeof SupplierSchema>;

function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
}: {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse dark:text-white">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2 border">C.I. o Ruc</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Contacto</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Dirección</th>
            <th className="p-2 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="even:bg-gray-100 dark:even:bg-gray-800">
              <td className="p-2 border">{supplier.identification}</td>
              <td className="p-2 border">{supplier.name}</td>
              <td className="p-2 border">{supplier.contact_person ?? ""}</td>
              <td className="p-2 border">{supplier.phone ?? ""}</td>
              <td className="p-2 border">{supplier.email ?? ""}</td>
              <td className="p-2 border">{supplier.address ?? ""}</td>
              <td className="p-2 border text-center space-x-2">
                <Button onPress={() => onEdit(supplier)} color="success" variant="bordered">
                  Editar
                </Button>
                <Button onPress={() => onDelete(supplier.id)} color="danger" variant="bordered">
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
          {suppliers.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                No hay proveedores para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SupplierDrawer({ isOpen, onClose, onSave, initialData }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SupplierForm) => void;
  initialData: Supplier | null;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<SupplierForm>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      identification: "",
      name: "",
      contact_person: undefined,
      phone: undefined,
      email: undefined,
      address: undefined,
    }
  });

  useEffect(() => {
    if (initialData) {
      setValue("identification", initialData.identification);
      setValue("name", initialData.name);
      setValue("contact_person", initialData.contact_person ?? undefined);
      setValue("phone", initialData.phone ?? undefined);
      setValue("email", initialData.email ?? undefined);
      setValue("address", initialData.address ?? undefined);
    }
  }, [initialData, setValue]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 backdrop:blur bg-opacity-30 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full bg-white dark:bg-gray-900 dark:text-white shadow-lg p-6 z-50 w-full max-w-xs sm:max-w-sm">
        <Button onPress={onClose} variant="bordered" className="mb-4">
          × Cerrar
        </Button>
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold">{initialData ? "Editar Proveedor" : "Crear Proveedor"}</h2>
           <label className="flex flex-col">
            <span>Cedula o Ruc  *</span>
            <input className="input" {...register("identification")} />
            {errors.identification && <span className="text-red-600">{errors.identification.message}</span>}
          </label>
          <label className="flex flex-col">
            <span>Nombre *</span>
            <input className="input" {...register("name")} />
            {errors.name && <span className="text-red-600">{errors.name.message}</span>}
          </label>

          <label className="flex flex-col">
            <span>Persona de contacto</span>
            <input className="input" {...register("contact_person")} />
            {errors.contact_person && <span className="text-red-600">{errors.contact_person.message}</span>}
          </label>

          <label className="flex flex-col">
            <span>Teléfono</span>
            <input className="input" {...register("phone")} />
            {errors.phone && <span className="text-red-600">{errors.phone.message}</span>}
          </label>

          <label className="flex flex-col">
            <span>Correo</span>
            <input className="input" {...register("email")} />
            {errors.email && <span className="text-red-600">{errors.email.message}</span>}
          </label>

          <label className="flex flex-col">
            <span>Dirección</span>
            <textarea className="input" {...register("address")} />
            {errors.address && <span className="text-red-600">{errors.address.message}</span>}
          </label>

          <Button type="submit" color="success" variant="bordered">
            Guardar
          </Button>
        </form>
      </aside>
    </>
  );
}


export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { loadSuppliers(); }, []);

  async function loadSuppliers() {
    setLoading(true);
    try { setSuppliers(await getSuppliers()); } catch { alert("Error cargando proveedores"); }
    finally { setLoading(false); }
  }

  const handleSave = async (data: SupplierForm) => {
    setLoading(true);
    try {
      let result: Supplier;
      if (editingSupplier) {
        result = await updateSupplier(editingSupplier.id, data);
        setSuppliers(prev => prev.map(s => s.id === result.id ? result : s));
        addToast({ title: "Proveedor actualizado", color: "success", variant: "bordered" });
      } else {
        result = await createSupplier(data);
        setSuppliers(prev => [...prev, result]);
        addToast({ title: "Proveedor creado", color: "success", variant: "bordered" });
      }
      closeDrawer();
    } catch (error: any) {
      if (error.response?.status === 400) {
        addToast({ title: "Error de validación", description: error.response.data.message, color: "danger", variant: "bordered" });
      } else {
        addToast({ title: "Error guardando proveedor", description: error.message, color: "danger", variant: "bordered" });
      }
      
    } finally { setLoading(false); }
  };

  function openCreate() { setEditingSupplier(null); setDrawerOpen(true); }
  function openEdit(supplier: Supplier) { setEditingSupplier(supplier); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); setEditingSupplier(null); }

  function handleDeleteClick(id: string) {
    setSelectedId(id);
    setModalOpen(true);
  }


async function handleDeleteConfirmed() {
  if (!selectedId) return;
  setLoading(true);
  try {
    await deleteSupplier(selectedId);
    setSuppliers((prev) => prev.filter((s) => s.id !== selectedId));
    addToast({ title: "Proveedor eliminado", color: "success", variant: "bordered" });
  } catch (error: any)
  {
      const backendMessage = error?.response?.data?.message;
    
          addToast({
            title: "Error eliminando proveedor",
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
    <main className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Gestión de Proveedores</h1>
        <Button onPress={openCreate} disabled={loading} color="success" variant="bordered">+ Crear Proveedor</Button>
      </header>

      {loading && <p className="mb-4 text-gray-700 dark:text-gray-300">Cargando...</p>}

      <SupplierTable suppliers={suppliers} onEdit={openEdit} onDelete={handleDeleteClick} />

      <SupplierDrawer isOpen={drawerOpen} onClose={closeDrawer} onSave={handleSave} initialData={editingSupplier} />
       <ConfirmModal
      isOpen={modalOpen}
      title="¿Eliminar proveedor?"
      message="Esta acción no se puede deshacer."
      onConfirm={handleDeleteConfirmed}
      onCancel={() => setModalOpen(false)}
    />
    
    </main>
  );
}
