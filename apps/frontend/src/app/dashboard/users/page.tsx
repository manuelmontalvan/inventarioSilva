"use client";
import { useEffect, useState } from "react";
import { UserI } from "@/types/user";
import { getUsers } from "@/lib/api"; // Asegúrate de que esta función esté definida para obtener los usuarios
import UserTable from "@/components/user/userTable";
import CreateUserModal from "@/components/user/createUserModal";
import EditUserModal from "@/components/user/editUserModal";
import DeleteUserModal from "@/components/user/deleteUserModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, User, Search } from "lucide-react";
import UserDetailsModal from "@/components/user/userDetailModal";

export default function AdminPage() {
  const [users, setUsers] = useState<UserI[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserI | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const handleShowDetails = (user: UserI) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers(); // ya lee el token del localStorage
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullText =
      `${user.name} ${user.lastname} ${user.role?.name}`.toLowerCase();
    return fullText.includes(searchTerm.toLowerCase());
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Acceso Denegado</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-black min-h-screen">
      <div className="flex flex-col justify-between items-center mb-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Gestión de Usuarios
        </h1>

        <div className="flex flex-col justify-between sm:flex-row gap-4 w-full">
          {/* Input de búsqueda */}
          <div className="relative w-full sm:w">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nombre, apellido o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 pl-10 pr-4 py-2 rounded"
            />
          </div>

          <Button
            variant="outline"
            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30 flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            Crear Usuario
          </Button>
        </div>
      </div>
      <div className="rounded-md border border-gray-800 overflow-hidden bg-gray-900 shadow-lg text-white">
        <UserTable
          users={users}
          onView={handleShowDetails}
          onUpdated={(user) => {
            setSelectedUser(user);
            setShowEditModal(true);
          }}
          onDelete={(user) => {
            setSelectedUser(user);
            setShowDeleteModal(true);
          }}
        />
      </div>
      <UserDetailsModal
        user={selectedUser}
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      
      />

      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchUsers}
      />
      <EditUserModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onUpdated={fetchUsers}
      />
      <DeleteUserModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        user={selectedUser}
        onDeleted={fetchUsers}
      />
    </div>
  );
}
