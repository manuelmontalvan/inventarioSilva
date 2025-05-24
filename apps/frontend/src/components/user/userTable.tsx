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
import { Trash2, Edit, Info } from "lucide-react";

interface Props {
  users: UserI[];
  onView: (user: UserI) => void;
  onUpdated: (user: UserI) => void;
  onDelete: (user: UserI) => void;
}

export default function UserTable({ users, onView ,onUpdated, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserI | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "email" | "roleName";
    direction: "ascending" | "descending";
  } | null>(null);

  const requestSort = (key: "name" | "email" | "roleName") => {
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
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;

    let aKey: string | number = "";
    let bKey: string | number = "";

    // Para roleName lo manejamos aparte
    if (sortConfig.key === "roleName") {
      aKey = a.role.name;
      bKey = b.role.name;
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
          <TableHead
            className="text-white cursor-pointer"
            onClick={() => requestSort("name")}
          >
            Nombre
            {sortConfig?.key === "name" && (
              <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>
            )}
          </TableHead>
          <TableHead
            className="text-white cursor-pointer"
            onClick={() => requestSort("email")}
          >
            Email
            {sortConfig?.key === "email" && (
              <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>
            )}
          </TableHead>
          <TableHead
            onClick={() => requestSort("roleName")}
            className="text-white"
          >
            Rol
            {sortConfig?.key === "roleName" && (
              <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>
            )}
          </TableHead>
          <TableHead className="text-white text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <AnimatePresence>
          {sortedUsers.map((user) => (
            <motion.tr
              key={user.id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ backgroundColor: "#ffffff05" }} // Sutil feedback al pasar el mouse
              transition={{ duration: 0.2 }}
            >
              <TableCell className="font-medium text-gray-200">
                {user.name}
              </TableCell>
              <TableCell className="text-gray-400">{user.email}</TableCell>
              <TableCell className="text-gray-300">{user.role.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onView(user)} // Abre el modal de detalles
                  className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 hover:text-gray-300 border-gray-500/30
                                                         transition-all duration-200" // Añadida transición
                  title="Ver Detalles"
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdated(user)}
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30
                                                         transition-all duration-200" // Añadida transición
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(user)}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border-red-500/30
                                                                 transition-all duration-200" // Añadida transición
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
}
