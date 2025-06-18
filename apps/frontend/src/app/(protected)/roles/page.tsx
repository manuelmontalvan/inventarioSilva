"use client";
import { useEffect, useState } from "react";
import { Role  } from "@/types/role";
import { getRoles } from "@/lib/api/users/role";
import RoleTable from "@/components/rolesModal/roleTable";
import CreateRoleModal from "@/components/rolesModal/createRoleModal";
import EditRoleModal from "@/components/rolesModal/editRoleModal";
import DeleteRoleModal from "@/components/rolesModal/deleteRoleModal";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/button";
import { ShieldPlus, Shield, Search, Settings2 } from "lucide-react";


export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
  
  });

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar roles");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBulkDelete = async () => {
    await Promise.all(
      selectedRoles.map((id) =>
        fetch(`http://localhost:3001/api/roles/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
      )
    );
    setSelectedRoles([]);
    fetchRoles();
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
          <h2 className="text-2xl font-bold text-red-400">Error</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen dark:bg-gray-950">
      <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-500  dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          Gestión de Roles
        </h1>
        <Button
          onPress={() => setShowCreateModal(true)}
         className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600"
        >
          <ShieldPlus className="w-4 h-4" /> Crear Rol
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 max-w-6xl mx-auto">
        <div className="relative w-full sm:w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 pl-10 pr-4 py-2 rounded"
          />
        </div>

      

        {selectedRoles.length > 0 && (
          <div className="bg-gray-800 px-3 py-2 rounded text-white flex items-center gap-2">
            <span className="text-sm">{selectedRoles.length} seleccionado(s)</span>
            <Button
              variant="bordered"
              color="danger"
              onPress={() => {
                setBulkDeleteMode(true);
                setSelectedRole(null);
                setShowDeleteModal(true);
              }}
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-800 overflow-hidden bg-gray-900 shadow-lg text-white max-w-6xl mx-auto">
        <RoleTable
          roles={filteredRoles}
        
          onUpdated={(role) => {
            setSelectedRole(role);
            setShowEditModal(true);
          }}
          onDelete={(role) => {
            setSelectedRole(role);
            setBulkDeleteMode(false);
            setShowDeleteModal(true);
          }}
          selectedRoles={selectedRoles}
          setSelectedRoles={setSelectedRoles}
     
        />
      </div>

     
      <CreateRoleModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchRoles}
      />
      <EditRoleModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        role={selectedRole}
        onUpdated={fetchRoles}
      />
      <DeleteRoleModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBulkDeleteMode(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        multiple={bulkDeleteMode}
        onDelete={fetchRoles}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
