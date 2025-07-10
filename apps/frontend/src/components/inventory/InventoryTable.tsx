'use client';

import { useState } from 'react';
import { InventoryMovement } from '@/types/inventory';

interface Props {
  movements: InventoryMovement[];
}

export default function InventoryTable({ movements }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(movements.length / itemsPerPage);
  const paginated = movements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="overflow-auto border rounded-lg shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-100">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Unidad</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Localidad</th>
              <th className="px-4 py-2">Percha</th>
              <th className="px-4 py-2">Orden</th>
              <th className="px-4 py-2">Factura</th>
              <th className="px-4 py-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((m) => (
              <tr
                key={m.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2">
                  {new Date(m.createdAt).toLocaleString('es-EC', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    timeZone: 'UTC',
                  })}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      m.type === 'IN'
                        ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                        : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                    }`}
                  >
                    {m.type === 'IN' ? 'Entrada' : 'Salida'}
                  </span>
                </td>
                <td className="px-4 py-2">{m.productName || m.product?.name || '-'}</td>
                <td className="px-4 py-2">{m.brandName || '-'}</td>
                <td className="px-4 py-2">{m.unitName || '-'}</td>
                <td className="px-4 py-2">{m.quantity}</td>
                <td className="px-4 py-2">{m.locality?.name || '-'}</td>
                <td className="px-4 py-2">{m.shelfName || m.shelfId || '-'}</td>
                <td className="px-4 py-2">{m.orderNumber || '-'}</td>
                <td className="px-4 py-2">{m.invoice_number || '-'}</td>
                <td className="px-4 py-2">{m.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-end items-center gap-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
