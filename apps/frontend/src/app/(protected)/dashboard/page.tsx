"use client";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-2xl rounded-xl shadow-md bg-white dark:bg-gray-800 p-10 space-y-6">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">
          Bienvenido al Sistema de Inventario
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          Esta plataforma te permite gestionar productos, controlar inventario y visualizar métricas clave de forma clara y eficiente.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Productos</p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">154</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ventas Mensuales</p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">$4,500</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
