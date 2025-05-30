"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, addToast } from "@heroui/react";

interface Role {
  id: number;
  name: string;
  description?: string;
}

const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  onUpdated: () => void;
}

export default function EditRoleModal({
  open,
  onClose,
  role,
  onUpdated,
}: EditRoleModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description ?? "",
      });
    }
  }, [role, form]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!role) return;

    try {
      const res = await fetch(`http://localhost:3001/api/roles/${role.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error actualizando rol:", res.status, text);
        return;
      }

      addToast({
        title: "Rol actualizado",
        description: "El rol se ha actualizado exitosamente.",
        color: "success",
      });

      onUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error inesperado:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-gradient-to-br from-gray-900 via-purple-900 to-black border border-white/10 text-white shadow-lg max-w-md w-full p-6"
      >
        <DialogHeader>
          <DialogTitle>Editar Rol</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del rol</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Administrador" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descripción del rol" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="pt-4">
          <Button variant="bordered" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            variant="bordered"
            color="success"
            onPress={() => form.handleSubmit(onSubmit)()}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
