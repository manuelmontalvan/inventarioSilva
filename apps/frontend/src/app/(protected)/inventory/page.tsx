"use client";

import { useEffect, useState } from "react";
import {
  getInventoryMovements,
  createInventoryMovement,
} from "@/lib/api/inventory";
import {
  InventoryMovement,
  CreateInventoryMovementsDto,
} from "@/types/inventory";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";

import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryTable from "@/components/inventory/InventoryTable";

export default function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  const loadMovements = async () => {
    try {
      const data = await getInventoryMovements();
      setMovements(data);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  // Función que pasaremos a InventoryForm para crear movimientos
  const handleSubmit = async (data: {
    type: "IN" | "OUT";
    movements: {
      productId: string;
      quantity: number;
      unitId: string;
      productName: string;
      brandName: string;
      unitName: string;
    }[];
    invoice_number?: string;
    orderNumber?: string;
    notes?: string;
  }) => {
    // Aquí iteramos para crear movimientos uno por uno (o hacer batch si tu backend lo soporta)
    for (const movement of data.movements) {
      await createInventoryMovement({
        type: data.type,
        movements: data.movements,
        invoice_number: data.invoice_number,
        orderNumber: data.orderNumber,
        notes: data.notes,
      });
      // Llamas a tu API para crear el movimiento
    }
    // Luego recargas movimientos
    await loadMovements();
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Movimiento</CardTitle>
          <CardDescription>
            Registra entradas o salidas de productos al inventario.
          </CardDescription>
          <CardAction></CardAction>
        </CardHeader>
        <CardContent>
          {/* PASAMOS handleSubmit CORRECTAMENTE */}
          <InventoryForm onSubmit={handleSubmit} />
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Todos los campos marcados son obligatorios.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            Visualiza todos los movimientos registrados, incluyendo entradas y
            salidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTable movements={movements} />
        </CardContent>
      </Card>
    </div>
  );
}
