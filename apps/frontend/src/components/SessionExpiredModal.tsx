// components/SessionExpiredModal.tsx
import React from "react";
import { useEffect } from "react";

const SessionExpiredModal = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 4000); // se cierra en 4 segundos automáticamente

    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <h2 className="text-xl font-semibold mb-2">Sesión Expirada</h2>
        <p className="mb-4">Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ir al login
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
