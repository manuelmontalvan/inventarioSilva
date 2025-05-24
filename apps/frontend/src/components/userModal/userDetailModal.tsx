"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { UserI } from "@/types/user";
import React from "react";

export default function UserDetailsModal({
  user,
  open,
  onClose,
}: {
  user: UserI | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={open} onOpenChange={onClose} backdrop="blur">
      <ModalContent className="bg-gradient-to-br from-gray-900 via-purple-900 to-black border border-white/10 text-white shadow-xl w-full max-w-3xl mx-auto">
        <ModalHeader>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-white">
              Detalles del Usuario
            </h2>
            <p className="text-gray-400 text-sm">
              Información completa del usuario seleccionado.
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          {user && (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Imagen del usuario */}
              <div className="flex-shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-2 border-white"
                />
              </div>

              {/* Información del usuario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="p-4 bg-gray-800 rounded-md">
                  <h3 className="text-md font-semibold text-gray-200">
                    Nombre:
                  </h3>
                  <p className="text-gray-400">{user.name}</p>
                </div>

                <div className="p-4 bg-gray-800 rounded-md">
                  <h3 className="text-md font-semibold text-gray-200">
                    Apellido:
                  </h3>
                  <p className="text-gray-400">{user.lastname}</p>
                </div>

                <div className="p-4 bg-gray-800 rounded-md">
                  <h3 className="text-md font-semibold text-gray-200">
                    Email:
                  </h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>

                <div className="p-4 bg-gray-800 rounded-md">
                  <h3 className="text-md font-semibold text-gray-200">Rol:</h3>
                  <p className="text-gray-400">
                    {user.role?.name ?? "No asignado"}
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-md">
                  <h3 className="text-md font-semibold text-gray-200">
                    Fecha de Contratación:
                  </h3>
                  <p className="text-gray-400">
                    {user.hiredDate
                      ? new Date(user.hiredDate).toLocaleDateString()
                      : "No registrada"}
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-md">
                  <h3 className="text-md font-semibold text-gray-200">
                    Último Acceso:
                  </h3>
                  <p className="text-gray-400">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "No registrado"}
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-md">
                  <h3 className="text-md font-semibold text-gray-200">
                    Activo:
                  </h3>
                  <p
                    className={`px-2 py-1 inline-block rounded-full text-xs font-semibold ${
                      user.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" color="danger" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
