import { UserI } from "@/types/user";

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserI | null;
  onDeleted: () => void;
}

export default function DeleteUserModal({ open, onClose, user, onDeleted }: Props) {
  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!user) return;
    await fetch(`http://localhost:3001/api/users/${user.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    onDeleted();
    onClose();
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">¿Eliminar usuario?</h2>
        <p className="mb-4">Estás a punto de eliminar a <strong>{user.name}</strong>.</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
        </div>
      </div>
    </div>
  );
}
