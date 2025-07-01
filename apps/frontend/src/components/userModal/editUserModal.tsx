"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { getRoles } from "@/lib/api/users/role";
import { Role } from "@/types/role";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/react";
import { UserI } from "@/types/user";
const formSchema = z.object({
  name: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  hiredDate: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserI | null;
  onUpdated: () => void;
}

export default function EditUserModal({
  open,
  onClose,
  user,
  onUpdated,
}: EditUserModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      password: "",
      hiredDate: "",
      roleId: "",
      isActive: true,
    },
  });

  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: "",
        hiredDate: user.hiredDate?.split("T")[0],
        roleId: user.role?.id,
        isActive: Boolean(user.isActive),
      });
    }
  }, [user, form]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getRoles();
        setRoles(roles); // ✅
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };

    if (open) fetchRoles();
  }, [open]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!user) return;

    const payload: any = {
      ...values,
      roleId: values.roleId ?? user.role.id,
      isActive: values.isActive ?? user.isActive,
    };

    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error actualizando usuario, status:", res.status);
        console.error("Respuesta (texto):", text);
        return;
      }
      addToast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado exitosamente.",
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
      <DialogContent className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white shadow-xl max-w-2xl w-full mx-4 sm:mx-auto p-6 sm:p-8 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Editar Usuario
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Apellido" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="Email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder="Nueva contraseña (opcional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hiredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de contratación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <SelectItem key={role.id} value={String(role.id)}>
                              {role.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No hay roles disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        ref={field.ref}
                        id="isActive-checkbox"
                      />
                    </FormControl>
                    <FormLabel htmlFor="isActive-checkbox">Activo</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter className="pt-6 flex justify-end gap-4">
          <Button variant="bordered" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="success"
            variant="bordered"
            onPress={() => form.handleSubmit(onSubmit)()}
            type="button"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
