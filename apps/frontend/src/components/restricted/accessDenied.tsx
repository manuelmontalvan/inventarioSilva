import { AlertTriangle } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center ">
      <div className="animate-pulse mb-6">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto" />
      </div>
      <h2 className="text-3xl font-extrabold text-red-700 mb-2 drop-shadow-sm">
        Acceso denegado
      </h2>
      <p className="text-red-500 max-w-md mx-auto text-lg">
        No tienes permiso para ver esta página.
      </p>
    </div>
  );
}
