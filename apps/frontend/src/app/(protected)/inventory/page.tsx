// src/app/(protected)/inventory/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getInventoryMovements,
  createInventoryMovement,
} from "@/lib/api/inventory";
import { InventoryMovement } from "@/types/inventory";
import ProtectedRoute from "@/components/restricted/protectedRoute";

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

  const handleSubmit = async (data: {
    type: "IN" | "OUT";
    movements: {
      productId: string;
      quantity: number;
      unitId: string;
      localityId: string;
      productName?: string;
      brandName?: string;
      unitName?: string;
    }[];
    invoice_number?: string;
    orderNumber?: string;
    notes?: string;
  }) => {
    await createInventoryMovement(data);
    await loadMovements();
  };

  return (
    <ProtectedRoute>
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
              Visualiza todos los movimientos registrados, incluyendo entradas y salidas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryTable movements={movements} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
