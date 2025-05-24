"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserI } from "@/types/user"; // Asegúrate de importar tu interfaz correctamente
import React from "react";


interface UserDetailsModalProps {
  user: UserI | null;
  open: boolean;
  onClose: () => void;
 
}

export default function UserDetailsModal({ user, open, onClose }: UserDetailsModalProps) {


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-md bg-black/50 border border-white/10 text-white shadow-xl px-4">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Detalles del Usuario</DialogTitle>
          <DialogDescription className="text-gray-400">
            Información completa del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800 rounded-md">
              <h3 className="text-md font-semibold text-gray-200">Nombre:</h3>
              <p className="text-gray-400">{user.name}</p>
            </div>

            <div className="p-4 bg-gray-800 rounded-md">
              <h3 className="text-md font-semibold text-gray-200">Apellido:</h3>
              <p className="text-gray-400">{user.lastname}</p>
            </div>

            <div className="p-4 bg-gray-800 rounded-md">
              <h3 className="text-md font-semibold text-gray-200">Email:</h3>
              <p className="text-gray-400">{user.email}</p>
            </div>

            <div className="p-4 bg-gray-800 rounded-md">
              <h3 className="text-md font-semibold text-gray-200">Rol:</h3>
              <p className="text-gray-400">{user.role?.name ?? "No asignado"}</p>
            </div>

            <div className="p-4 bg-gray-800 rounded-md">
              <h3 className="text-md font-semibold text-gray-200">Fecha de Contratación:</h3>
              <p className="text-gray-400">
                {user.hiredDate ? new Date(user.hiredDate).toLocaleDateString() : "No registrada"}
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-md">
              <h3 className="text-md font-semibold text-gray-200">Último Acceso:</h3>
              <p className="text-gray-400">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "No registrado"}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="bg-gray-700 text-white hover:bg-gray-600 hover:text-gray-200 border-gray-700"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
