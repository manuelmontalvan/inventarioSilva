'use client';

import { InventoryMovement } from '@/types/inventory';

interface Props {
  movements: InventoryMovement[];
}

export default function InventoryTable({ movements }: Props) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Producto</th>
            <th className="px-4 py-2">Cantidad</th>
            <th className="px-4 py-2">Notas</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-2">{new Date(m.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2">{m.type === 'IN' ? 'Entrada' : 'Salida'}</td>
              <td className="px-4 py-2">{m.product.name}</td>
              <td className="px-4 py-2">{m.quantity}</td>
              <td className="px-4 py-2">{m.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
