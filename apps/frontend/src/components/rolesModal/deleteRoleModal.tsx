import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button, addToast } from "@heroui/react";
import { useState } from "react";

interface Role {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  onDelete: () => void;
  multiple?: boolean;
  onConfirm: () => Promise<void>;
}

export default function DeleteRoleModal({
  open,
  onClose,
  role,
  onDelete,
  multiple = false,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (multiple) {
        await onConfirm();
        onClose();
        return;
      }

      if (!role) return;

      const res = await fetch(`http://localhost:3001/api/roles/${role.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Error al eliminar el rol");
      }

      addToast({
        title: "Rol eliminado",
        description: "El rol se ha eliminado exitosamente.",
        color: "success",
      });

      onDelete();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Ocurrió un error al eliminar el rol",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal backdrop="blur" isOpen={open} onClose={onClose}>
      <ModalContent className="bg-gradient-to-br from-gray-900 via-purple-900 to-black border border-white/10 text-white shadow-xl px-4">
        <ModalHeader>
          <h2 className="text-lg font-bold">¿Eliminar rol?</h2>
        </ModalHeader>
        <ModalBody>
          <p>
            {multiple
              ? "¿Estás seguro de que deseas eliminar los roles seleccionados?"
              : `¿Estás seguro de que deseas eliminar el rol "${role?.name}"?`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose} variant="bordered" color="danger">
            Cancelar
          </Button>
          <Button
            onPress={handleDelete}
            color="warning"
            variant="bordered"
            isLoading={loading}
          >
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
