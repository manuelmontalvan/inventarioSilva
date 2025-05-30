"use client";
import { useEffect, useState } from "react";
import { UserI } from "@/types/user";
import { getUsers } from "@/lib/api/user";
import UserTable from "@/components/userModal/userTable";
import CreateUserModal from "@/components/userModal/createUserModal";
import EditUserModal from "@/components/userModal/editUserModal";
import DeleteUserModal from "@/components/userModal/deleteUserModal";
import UserDetailsModal from "@/components/userModal/userDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/button";
import { UserPlus, User, Search, Filter, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function AdminPage() {
  const [users, setUsers] = useState<UserI[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserI | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    lastname:true,
    email: true,
    role: true,
    hiredAt: true,
    lastLogin: true,
    isActive:true, 
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
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
    const matchesSearch = fullText.includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRoles.length === 0 ||
      selectedRoles.includes(user.role?.name?.toLowerCase());

    return matchesSearch && matchesRole;
  });
 
  const handleBulkDelete = async () => {
  

    await Promise.all(
      selectedUsers.map((id) =>
        fetch(`http://localhost:3001/api/users/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            
          },
        })
      )
    );

    setSelectedUsers([]);
    fetchUsers();
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

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
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Gestión de Usuarios
        </h1>
        <Button
          onPress={() => setShowCreateModal(true)}
          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Crear Usuario
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 max-w-6xl mx-auto">
        {/* Input de búsqueda */}
        <div className="relative w-full sm:w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 pl-10 pr-4 py-2 rounded"
          />
        </div>

        {/* Botones de filtro y columnas */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600">
                <Filter className="w-4 h-4 mr-2" /> Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-600">
              <DropdownMenuLabel>Filtrar por rol</DropdownMenuLabel>
              {["admin", "bodeguero", "vendedor"].map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="bordered"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600"
              >
                <Settings2 className="w-4 h-4 mr-2" /> Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-600">
              <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.name}
                onCheckedChange={() => toggleColumn("name")}
              >
                Nombre
              </DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem
                checked={visibleColumns.lastname}
                onCheckedChange={() => toggleColumn("lastname")}
              >
                Apellido
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.email}
                onCheckedChange={() => toggleColumn("email")}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.role}
                onCheckedChange={() => toggleColumn("role")}
              >
                Rol
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.hiredAt}
                onCheckedChange={() => toggleColumn("hiredAt")}
              >
                Fecha de contratación
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.lastLogin}
                onCheckedChange={() => toggleColumn("lastLogin")}
              >
                Última conexión
              </DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem
                checked={visibleColumns.isActive}
                onCheckedChange={() => toggleColumn("isActive")}
              >
               Activo
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Eliminar seleccionados */}
        {selectedUsers.length > 0 && (
          <div className="bg-gray-800 px-3 py-2 rounded text-white flex items-center gap-2">
            <span className="text-sm">
              {selectedUsers.length} seleccionado(s)
            </span>
            <Button
              variant="bordered"
              color="danger"
              onPress={() => {
                setBulkDeleteMode(true); // activar modo masivo
                setSelectedUser(null); // no se necesita un usuario individual
                setShowDeleteModal(true);
              }} // mostrar modal}
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-800 overflow-hidden bg-gray-900 shadow-lg text-white max-w-6xl mx-auto">
        <UserTable
          users={filteredUsers}
          onView={(user) => {
            setSelectedUser(user);
            setShowDetailsModal(true);
          }}
          onUpdated={(user) => {
            setSelectedUser(user);
            setShowEditModal(true);
          }}
          onDelete={(user) => {
            setSelectedUser(user);
            setBulkDeleteMode(false);
            setShowDeleteModal(true);
          }}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          visibleColumns={visibleColumns}
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
        onClose={() => {
          setShowDeleteModal(false);
          setBulkDeleteMode(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        multiple={bulkDeleteMode}
        onDelete={fetchUsers} // para eliminación individual
        onConfirm={handleBulkDelete} // para múltiples
      />
    </div>
  );
}
