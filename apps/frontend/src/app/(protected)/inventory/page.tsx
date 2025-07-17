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
import ProductStockTotalsModal from "@/components/productStock/totalModal";
import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryTable from "@/components/inventory/InventoryTable";
import { Button } from "@heroui/button";

export default function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [openTotalsModal, setOpenTotalsModal] = useState(false);

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
    productId: string | undefined;
    quantity: number;
    unitId: string | undefined;
    localityId?: string | undefined;
    productName?: string;
    brandName?: string;
    unitName?: string;
    shelfId?: string;
    shelfName?: string;
  }[];
  invoice_number?: string;
  orderNumber?: string;
  notes?: string;
}) => {
  // Validar que todos los campos requeridos estén definidos
  const cleanedMovements = data.movements.map((m) => {
    if (!m.productId || !m.unitId || !m.localityId) {
      throw new Error("Faltan campos obligatorios en un movimiento.");
    }

    return {
      productId: m.productId,
      quantity: m.quantity,
      unitId: m.unitId,
      localityId: m.localityId,
      shelfId: m.shelfId,
      // si quieres incluir campos opcionales puedes añadirlos aquí
    };
  });

  await createInventoryMovement({
    type: data.type,
    movements: cleanedMovements,
    invoice_number: data.invoice_number,
    orderNumber: data.orderNumber,
    notes: data.notes,
  });

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
            <CardAction>
              <Button
                onPress={() => setOpenTotalsModal(true)}
                color="success"
                variant="bordered"
              >
                Ver Totales de Stock
              </Button>
            </CardAction>
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
              Visualiza todos los movimientos registrados, incluyendo entradas y
              salidas.
            </CardDescription>
          </CardHeader>
          <CardContent>
           <InventoryTable movements={movements} onClear={loadMovements} />

          </CardContent>
        </Card>
      </div>
      <ProductStockTotalsModal
        open={openTotalsModal}
        onClose={() => setOpenTotalsModal(false)}
      />
    </ProtectedRoute>
  );
}
