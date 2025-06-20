'use client';

import { useEffect, useState } from 'react';
import { getInventoryMovements } from '@/lib/api/inventory';
import { InventoryMovement } from '@/types/inventory';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';

import InventoryForm from '@/components/inventory/InventoryForm';
import InventoryTable from '@/components/inventory/InventoryTable';

export default function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  const loadMovements = async () => {
    try {
      const data = await getInventoryMovements();
      setMovements(data);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Sección para registrar movimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Movimiento</CardTitle>
          <CardDescription>
            Registra entradas o salidas de productos al inventario.
          </CardDescription>
          <CardAction>
            {/* Puedes agregar un botón aquí si lo deseas */}
            {/* Ejemplo: <Button size="sm">Ayuda</Button> */}
          </CardAction>
        </CardHeader>

        <CardContent>
          <InventoryForm onCreated={loadMovements} />
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">Todos los campos marcados son obligatorios.</p>
        </CardFooter>
      </Card>

      {/* Sección de historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            Visualiza todos los movimientos registrados, incluyendo entradas y salidas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <InventoryTable movements={movements} />
        </CardContent>
      </Card>
    </div>
  );
}
