import { UserI } from "@/types/user";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/react";

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserI | null;
  onDelete: () => void;
  multiple?: boolean; // <- NUEVO
  onConfirm: () => void;
}

export default function DeleteUserModal({
  open,
  onClose,
  user,
  onDelete,
  multiple = false, // <- NUEVO
  onConfirm,
}: Props) {
  const handleDelete = async () => {
    try {
      if (multiple) {
        await onConfirm();
        onClose();
        return;
      }

      if (!user) return;

      const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        addToast({
          title: "Error",
          description: err.message || "Error al eliminar el usuario",
          color: "danger",
        });
        return;
      }

      addToast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado exitosamente.",
        color: "success",
      });

      onDelete();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Ocurrió un error al eliminar",
        color: "danger",
      });
    }
  };

  if (!open) return null;

  return (
    <Modal backdrop="blur" isOpen={open} onClose={onClose}>
      <ModalContent
        className="
          max-w-md w-full mx-4 sm:mx-auto rounded-xl
          border border-white/10 dark:border-white/20
          bg-white dark:bg-[#1f1f1f] text-gray-800 dark:text-gray-100
          shadow-2xl p-6
        "
      >
        <ModalHeader>
          <h2 className="text-xl font-semibold text-center">
            {multiple ? "Eliminar usuarios" : "Eliminar usuario"}
          </h2>
        </ModalHeader>

        <ModalBody>
          <p className="text-center text-gray-700 dark:text-gray-300">
            {multiple
              ? "¿Estás seguro de que deseas eliminar los usuarios seleccionados?"
              : `¿Estás seguro de que deseas eliminar al usuario "${
                  user?.name ?? ""
                } ${user?.lastname ?? ""}"? Esta acción no se puede deshacer.`}
          </p>
        </ModalBody>

        <ModalFooter className="flex justify-center gap-4 pt-4">
          <Button
            onPress={onClose}
            variant="solid"
            color="default"
            className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
          >
            Cancelar
          </Button>

          <Button
            onPress={handleDelete}
            variant="shadow"
            color="danger"
            className="w-full sm:w-auto"
          >
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
