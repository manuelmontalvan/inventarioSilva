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
      <ModalContent  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white shadow-xl max-w-2xl w-full mx-4 sm:mx-auto p-6 sm:p-8 rounded-lg">

        <ModalHeader>
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold dark:text-white">
              Detalles del Usuario
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Información completa del usuario seleccionado.
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="overflow-y-auto max-h-[80vh]">
          {user && (
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Imagen */}
              <div className="flex justify-center sm:justify-start">
                <img
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-2 border-white"
                />
              </div>

              {/* Datos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {[
                  { label: "Nombre", value: user.name },
                  { label: "Apellido", value: user.lastname },
                  { label: "Email", value: user.email },
                  { label: "Rol", value: user.role?.name ?? "No asignado" },
                  {
                    label: "Fecha de Contratación",
                    value: user.hiredDate
                      ? new Date(user.hiredDate).toLocaleDateString()
                      : "No registrada",
                  },
                  {
                    label: "Último Acceso",
                    value: user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "No registrado",
                  },
                  {
                    label: "Activo",
                    value: (
                      <span
                        className={`px-2 py-1 inline-block rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    ),
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 rounded-md w-full break-words"
                  >
                    <h3 className="text-sm font-semibold text-gray-200 mb-1">
                      {item.label}:
                    </h3>
                    <p className="text-gray-400 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="mt-6">
          <Button
            variant="bordered"
            color="danger"
            onPress={onClose}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
