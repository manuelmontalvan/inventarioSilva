"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { getRoles } from "@/lib/api/users/role";
import { updateUser } from "@/lib/api/users/user"; 
import { Role } from "@/types/role";
import { UserI } from "@/types/user";

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
        roleId: String(user.role?.id),
        isActive: Boolean(user.isActive),
      });
    }
  }, [user, form]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getRoles();
        setRoles(roles);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };

    if (open) fetchRoles();
  }, [open]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!user) return;

    const payload: Partial<FormValues> & { roleId?: string; isActive?: boolean } = {
      ...values,
      roleId: values.roleId || String(user.role.id),
      isActive: values.isActive ?? user.isActive,
    };

    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }

    try {
      await updateUser(user.id, payload);

      addToast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado exitosamente.",
        color: "success",
      });

      onUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error actualizando usuario:", error);
      addToast({
        title: "Error",
        description: error?.message || "Error al actualizar el usuario.",
        color: "danger",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-black p-6 sm:p-8 rounded-xl max-w-2xl w-full mx-4 sm:mx-auto text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Editar Usuario</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NOMBRE */}
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

              {/* APELLIDO */}
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

              {/* EMAIL */}
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

              {/* CONTRASEÑA */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder="Nueva contraseña (opcional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FECHA CONTRATACIÓN */}
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

              {/* ROL */}
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ACTIVO */}
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
