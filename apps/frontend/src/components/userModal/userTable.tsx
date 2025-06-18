import { UserI } from "@/types/user";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Info, Users2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  users: UserI[];
  onView: (user: UserI) => void;
  onUpdated: (user: UserI) => void;
  onDelete: (user: UserI) => void;
  selectedUsers: number[];
  setSelectedUsers: (ids: number[]) => void;
  visibleColumns: {
    name: boolean;
    lastname: boolean;
    email: boolean;
    role: boolean;
    hiredAt: boolean;
    lastLogin: boolean;
    isActive: boolean;
  };
}

export default function UserTable({
  users,
  onView,
  onUpdated,
  onDelete,
  selectedUsers,
  setSelectedUsers,
  visibleColumns,
}: Props) {
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "lastname" | "email" | "roleName" | "hiredDate" | "lastLogin";
    direction: "ascending" | "descending";
  } | null>(null);

  const requestSort = (
    key: "name" | "lastname" | "email" | "roleName" | "hiredDate" | "lastLogin"
  ) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };
  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig) return 0;

    let aKey: string | number = "";
    let bKey: string | number = "";

    if (sortConfig.key === "roleName") {
      aKey = a.role.name;
      bKey = b.role.name;
    } else if (
      sortConfig.key === "hiredDate" ||
      sortConfig.key === "lastLogin"
    ) {
      aKey = new Date(a[sortConfig.key] || 0).getTime();
      bKey = new Date(b[sortConfig.key] || 0).getTime();
    } else {
      aKey = a[sortConfig.key];
      bKey = b[sortConfig.key];
    }

    if (aKey < bKey) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aKey > bKey) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  return (
    <Table>
      <TableHeader className="bg-gray-800/50">
        <TableRow>
          <TableHead className="text-white">
            <Checkbox
              checked={selectedUsers.length === users.length}
              onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
            />
          </TableHead>
          {visibleColumns.name && (
            <TableHead
              className="text-white cursor-pointer"
              onClick={() => requestSort("name")}
            >
              Nombre
              {sortConfig?.key === "name" && (
                <span>
                  {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                </span>
              )}
            </TableHead>
          )}
          {visibleColumns.lastname && (
            <TableHead
              className="text-white cursor-pointer"
              onClick={() => requestSort("lastname")}
            >
              apellido
              {sortConfig?.key === "lastname" && (
                <span>
                  {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                </span>
              )}
            </TableHead>
          )}
          {visibleColumns.email && (
            <TableHead
              className="text-white cursor-pointer"
              onClick={() => requestSort("email")}
            >
              Email
              {sortConfig?.key === "email" && (
                <span>
                  {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                </span>
              )}
            </TableHead>
          )}
          {visibleColumns.role && (
            <TableHead
              className="text-white cursor-pointer"
              onClick={() => requestSort("roleName")}
            >
              Rol
              {sortConfig?.key === "roleName" && (
                <span>
                  {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                </span>
              )}
            </TableHead>
          )}
          {visibleColumns.hiredAt && (
            <TableHead
              className="text-white cursor-pointer"
              onClick={() => requestSort("hiredDate")}
            >
              Fecha de contratación
              {sortConfig?.key === "hiredDate" && (
                <span>
                  {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                </span>
              )}
            </TableHead>
          )}
          {visibleColumns.lastLogin && (
            <TableHead
              className="text-white cursor-pointer"
              onClick={() => requestSort("lastLogin")}
            >
              Última conexión
              {sortConfig?.key === "lastLogin" && (
                <span>
                  {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                </span>
              )}
            </TableHead>
          )}
          {visibleColumns.isActive && (
            <TableHead className="text-white cursor-pointer">
              Activo
              {sortConfig?.key === "lastLogin" && (
                <span>
                  {sortConfig.direction === "ascending" ? " ↑" : " ↓"}
                </span>
              )}
            </TableHead>
          )}
          <TableHead className="text-white text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence>
          {sortedUsers.map((user) => (
            <motion.tr
              key={user.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={rowVariants}
              className="even:bg-gray-800/30 cursor-pointer"
              onClick={() => onView(user)}
           >
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) =>
                    handleSelectUser(user.id, Boolean(checked))
                  }
                   onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              {visibleColumns.name && (
                <TableCell
                
                  className="font-medium  hover:bg-gray-700 text-white"
                >
                  {user.name}
                </TableCell>
              )}
              {visibleColumns.lastname && (
                <TableCell
                 
                  className="font-medium text-white  hover:bg-gray-700"
                >
                  {user.lastname}
                </TableCell>
              )}
              {visibleColumns.email && (
                <TableCell
             
                  className="text-gray-300  hover:bg-gray-700"
                >
                  {user.email}
                </TableCell>
              )}
              {visibleColumns.role && (
                <TableCell
             
                  className="text-gray-300  hover:bg-gray-700"
                >
                  {user.role.name}
                </TableCell>
              )}
              {visibleColumns.hiredAt && (
                <TableCell>
                  {user.hiredDate
                    ? new Date(user.hiredDate).toLocaleDateString()
                    : "—"}
                </TableCell>
              )}
              {visibleColumns.lastLogin && (
                <TableCell >
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "Nunca"}
                </TableCell>
              )}
              {visibleColumns.isActive && (
                <TableCell >
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
              )}

              <TableCell className="flex justify-center gap-2">
                <Button
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30
                                                         transition-all duration-200" // Añadida transición
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdated(user);
                  }}
                  aria-label={`Editar usuario ${user.name}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border-red-500/30
                                                                 transition-all duration-200" // Añadida transición
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(user);
                  }}
                  aria-label={`Eliminar usuario ${user.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
}
