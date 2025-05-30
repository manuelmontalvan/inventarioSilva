import { Button } from "@heroui/button";
import { Input } from "../ui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { addToast } from "@heroui/react";
import { UserPlus } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre del rol es requerido"),
});

export default function CreateRoleModal({ open, onClose, onCreated }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch("http://localhost:3001/api/roles", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const mensaje =
          typeof errorData.message === "string"
            ? errorData.message
            : Array.isArray(errorData.message)
              ? errorData.message[0]
              : "Error desconocido";

        if (mensaje.toLowerCase().includes("ya existe")) {
          form.setError("name", {
            type: "manual",
            message: "Este rol ya existe.",
          });
          return;
        }

        throw new Error(mensaje);
      }

      addToast({
        title: "Rol creado",
        description: "El rol se ha creado exitosamente.",
        color: "success",
      });

      onCreated();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Error al crear rol",
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
          max-w-md w-full mx-4 sm:mx-auto
          p-6 sm:p-8
        "
      >
        <ModalHeader>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-white text-2xl flex items-center gap-2 justify-center">
              <UserPlus className="w-6 h-6 text-blue-500" />
              Crear Rol
            </h1>
            <p className="text-gray-300 mt-1 max-w-md">
              Ingresa un nombre para crear un nuevo rol en el sistema.
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
