import { Role } from "@/types/role"; // Asegúrate que tengas este tipo definido
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
import { Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  roles: Role[];

  onUpdated: (role: Role) => void;
  onDelete: (role: Role) => void;
  selectedRoles: number[];
  setSelectedRoles: (ids: number[]) => void;
}

export default function RoleTable({
  roles,

  onUpdated,
  onDelete,
  selectedRoles,
  setSelectedRoles,
}: Props) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Role;
    direction: "ascending" | "descending";
  } | null>(null);

  const requestSort = (key: keyof Role) => {
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
      setSelectedRoles(roles.map((r) => r.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleSelectRole = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    }
  };

  const sortedRoles = [...roles].sort((a, b) => {
    if (!sortConfig) return 0;

    const aKey = a[sortConfig.key];
    const bKey = b[sortConfig.key];

    if (aKey < bKey) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aKey > bKey) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  return (
    <Table >
      <TableHeader className="bg-gray-800/50">
        <TableRow>
          <TableHead className="text-white">
            <Checkbox
              checked={selectedRoles.length === roles.length}
              onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
            />
          </TableHead>
          <TableHead
            className="text-white cursor-pointer"
            onClick={() => requestSort("name")}
          >
            Nombre del Rol
            {sortConfig?.key === "name" && (
              <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>
            )}
          </TableHead>
          <TableHead className="text-white text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody >
        <AnimatePresence>
          {sortedRoles.map((role) => (
            <motion.tr
              key={role.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={rowVariants}
              className="even:bg-gray-800/30 hover:bg-gray-700 cursor-pointer"
            >
              <TableCell>
                <Checkbox
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) =>
                    handleSelectRole(role.id, Boolean(checked))
                  }
                />
              </TableCell>
              <TableCell>{role.name}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30 transition-all duration-200"
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdated(role);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border-red-500/30 transition-all duration-200"
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(role);
                  }}
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
