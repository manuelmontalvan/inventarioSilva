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
      throw new Error("Error al eliminar el usuario");
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
      <ModalContent className="bg-gradient-to-br from-gray-900 via-purple-900 to-black border border-white/10 text-white shadow-xl px-4">
        <ModalHeader>
          <h2 className="text-lg font-bold">¿Eliminar usuario?</h2>
        </ModalHeader>
        <ModalBody>
          <p>
            {multiple
              ? "¿Estás seguro de que deseas eliminar los usuarios seleccionados?"
              : `¿Estás seguro de que deseas eliminar al usuario ${user?.name}?`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose} variant="bordered" color="danger">
            Cancelar
          </Button>
          <Button onPress={handleDelete} color="warning" variant="bordered">
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
