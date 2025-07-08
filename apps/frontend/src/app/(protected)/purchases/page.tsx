"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { getPurchaseOrders, createPurchaseOrder } from "@/lib/api/purchases/purchaseOrders";
import { getProducts } from "@/lib/api/products/products";
import { getSuppliers } from "@/lib/api/purchases/suppliers";
import { getCategories } from "@/lib/api/products/categories";
import { useAuth } from "@/context/authContext";
import { PurchaseOrder, CreatePurchaseOrderDto } from "@/types/purchaseOrders";
import { ProductI, Category } from "@/types/product";
import { SupplierI } from "@/types/supplier";

import { PurchaseOrderTable } from "@/components/productPurchase/purchaseOrderTable";
import PurchaseOrderForm from "@/components/productPurchase/purchaseOrderForm";

export default function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierI[]>([]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useAuth(); // Asegura autenticación si tu contexto lo requiere

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, suppliersData, productsData, categoriesData] = await Promise.all([
        getPurchaseOrders(),
        getSuppliers(),
        getProducts(),
        getCategories(),
      ]);

      setOrders(ordersData);
      setSuppliers(suppliersData);
      setProducts(productsData.data); // .data si viene paginado
      setCategories(categoriesData);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (payload: CreatePurchaseOrderDto) => {
    try {
      await createPurchaseOrder(payload);
      await fetchData(); // recarga después de crear
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        (error as any).response?.data?.message;

      alert("Error creando orden: " + (message || "Error desconocido"));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 flex justify-between gap-4">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
            Gestión de Órdenes de Compra
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-300">Cargando datos...</p>
        ) : (
          <div className="flex flex-col gap-10">
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <PurchaseOrderForm
                suppliers={suppliers}
                categories={categories}
                onCreate={handleCreateOrder}
              />
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 max-h-[70vh] overflow-auto">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
                Órdenes Registradas
              </h2>
              <PurchaseOrderTable orders={orders} products={products} />
            </section>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
