import { Button } from "@heroui/button";
import { Input } from "../ui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../ui/select";
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addToast } from "@heroui/react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}
interface Role {
  id: number;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  lastname: z.string().min(1, "Apellido requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  hiredDate: z.string().min(1, "Fecha requerida"),
  isActive: z.boolean(),
  roleId: z.number(),
});

export default function CreateUserModal({ open, onClose, onCreated }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      password: "",
      hiredDate: "",
      isActive: true,
      roleId: 1,
    },
  });

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch("http://localhost:3001/api/roles");
      const data = await res.json();
      setRoles(data);
    };
    if (open) fetchRoles();
  }, [open]);

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
         credentials: "include",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.message === "email ya en uso") {
          form.setError("email", {
            type: "manual",
            message: "Este correo ya está en uso.",
          });
          return;
        }
      }

      addToast({
        title: "Usuario creado",
        description: "El usuario se ha creado exitosamente.",
        color: "success",
      });

      onCreated();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Error al crear usuario",
        color: "danger",
      });
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      backdrop="blur"
      isDismissable={false}
    >
      <ModalContent
        className="
          bg-gradient-to-br from-gray-900 via-purple-900 to-black 
          border border-white/10 text-white shadow-lg 
          max-w-2xl w-full mx-4 sm:mx-auto
          p-6 sm:p-8
        "
      >
        <ModalHeader>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-white text-2xl flex items-center gap-2 justify-center">
              <UserPlus className="w-6 h-6 text-blue-500" />
              Crear Usuario
            </h1>
            <p className="text-gray-300 mt-1 max-w-md">
              Completa los datos para registrar un nuevo usuario.
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
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
                          placeholder="Contraseña"
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
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
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
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Activo</FormLabel>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <ModalFooter className="flex justify-end space-x-4">
            <div className="flex flex-wrap justify-end gap-2 mt-4">
              <Button
                onPress={onClose}
                variant="bordered"
                color="danger"
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                variant="bordered"
                color="success"
                onPress={() => form.handleSubmit(onSubmit)()}
                className="flex-1 sm:flex-none"
              >
                Crear
              </Button>
            </div>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
