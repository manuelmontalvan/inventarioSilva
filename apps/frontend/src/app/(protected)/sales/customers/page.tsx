"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Customer,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/api/sales/customers";

import { Button } from "@heroui/button";
import ConfirmModal from "@/components/confirmModal";
import { addToast } from "@heroui/toast";

// Zod schema para validar el formulario de cliente
const CustomerSchema = z.object({
  identification: z.string().min(1, "Cedula es obligatoria"),
  name: z.string().min(1, "El nombre es obligatorio"),
  lastname: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CustomerForm = z.infer<typeof CustomerSchema>;

function CustomerTable({
  customers,
  onEdit,
  onDelete,
}: {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse dark:text-white">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2 border">C.I.</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Apellido</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Dirección</th>
            <th className="p-2 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="even:bg-gray-100 dark:even:bg-gray-800"
            >
              <td className="p-2 border">{customer.identification}</td>
              <td className="p-2 border">{customer.name}</td>
              <td className="p-2 border">{customer.lastname ?? ""}</td>
              <td className="p-2 border">{customer.phone ?? ""}</td>
              <td className="p-2 border">{customer.email ?? ""}</td>
              <td className="p-2 border">{customer.address ?? ""}</td>
              <td className="p-2 border text-center space-x-2">
                <Button
                  onPress={() => onEdit(customer)}
                  color="success"
                  variant="bordered"
                >
                  Editar
                </Button>
                <Button
                  onPress={() => onDelete(customer.id)}
                  color="danger"
                  variant="bordered"
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="p-4 text-center text-gray-500 dark:text-gray-400"
              >
                No hay clientes para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CustomerDrawer({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerForm) => void;
  initialData: Customer | null;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: "",
      lastname: "",
      phone: "",
      identification: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name || "");
      setValue("lastname", initialData.lastname || "");
      setValue("identification", initialData.identification || "");
      setValue("phone", initialData.phone || "");
      setValue("email", initialData.email || "");
      setValue("address", initialData.address || "");
    } else {
      reset();
    }
  }, [initialData, setValue, reset]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 backdrop:blur  bg-opacity-30 z-40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-lg p-6 z-50 w-full max-w-xs sm:max-w-sm overflow-y-auto">
        <Button onPress={onClose} variant="bordered" className="mb-4">
          × Cerrar
        </Button>
        <form
          onSubmit={handleSubmit(onSave)}
          className="flex flex-col space-y-4"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Editar Cliente" : "Crear Cliente"}
          </h2>

          {[
            { label: "C.I. *", name: "identification" },
            { label: "Nombre *", name: "name" },
            { label: "Apellido", name: "lastname" },
            { label: "Teléfono", name: "phone" },
            { label: "Correo", name: "email" },
          ].map((field) => (
            <label key={field.name} className="flex flex-col">
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {field.label}
              </span>
              <input
                className="input bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register(field.name as keyof CustomerForm)}
              />
              {errors[field.name as keyof CustomerForm] && (
                <span className="text-red-500 text-sm">
                  {
                    errors[field.name as keyof CustomerForm]
                      ?.message as string | undefined
                  }
                </span>
              )}
            </label>
          ))}

          <label className="flex flex-col">
            <span className="text-sm text-gray-800 dark:text-gray-200">
              Dirección
            </span>
            <textarea
              className="input bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("address")}
            />
            {errors.address && (
              <span className="text-red-500 text-sm">{errors.address.message}</span>
            )}
          </label>

          <Button type="submit" color="success" variant="bordered">
            Guardar
          </Button>
        </form>
      </aside>
    </>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      setCustomers(await getCustomers());
    } catch {
      addToast({
        title: "Error cargando clientes",
        color: "danger",
        variant: "bordered",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (data: CustomerForm) => {
    setLoading(true);
    try {
      let result: Customer;
      if (editingCustomer) {
        result = await updateCustomer(editingCustomer.id, data);
        setCustomers((prev) =>
          prev.map((c) => (c.id === result.id ? result : c))
        );
        addToast({
          title: "Cliente actualizado",
          color: "success",
          variant: "bordered",
        });
      } else {
        result = await createCustomer(data);
        setCustomers((prev) => [...prev, result]);
        addToast({
          title: "Cliente creado",
          color: "success",
          variant: "bordered",
        });
      }
      closeDrawer();
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : error instanceof Error
          ? error.message
          : "Error desconocido";
      addToast({
        title: "Error guardando cliente",
        description: message,
        color: "danger",
        variant: "bordered",
      });
    } finally {
      setLoading(false);
    }
  };

  function openCreate() {
    setEditingCustomer(null);
    setDrawerOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingCustomer(null);
  }

  function handleDeleteClick(id: string) {
    setSelectedId(id);
    setModalOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedId) return;
    setLoading(true);
    try {
      await deleteCustomer(selectedId);
      setCustomers((prev) => prev.filter((c) => c.id !== selectedId));
      addToast({
        title: "Cliente eliminado",
        color: "success",
        variant: "bordered",
      });
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : error instanceof Error
          ? error.message
          : "Error desconocido";
      addToast({
        title: "Error eliminando cliente",
        description: message,
        color: "danger",
        variant: "bordered",
      });
    } finally {
      setLoading(false);
      setModalOpen(false);
      setSelectedId(null);
    }
  }

  return (
    <ProtectedRoute>
      <main className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">
            Gestión de Clientes
          </h1>
          <Button
            onPress={openCreate}
            disabled={loading}
            color="success"
            variant="bordered"
          >
            + Crear Cliente
          </Button>
        </header>

        {loading && (
          <p className="mb-4 text-gray-700 dark:text-gray-300">Cargando...</p>
        )}

        <CustomerTable
          customers={customers}
          onEdit={openEdit}
          onDelete={handleDeleteClick}
        />
        <CustomerDrawer
          isOpen={drawerOpen}
          onClose={closeDrawer}
          onSave={handleSave}
          initialData={editingCustomer}
        />
        <ConfirmModal
          isOpen={modalOpen}
          title="¿Eliminar cliente?"
          message="Esta acción no se puede deshacer."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setModalOpen(false)}
        />
      </main>
    </ProtectedRoute>
  );
}
