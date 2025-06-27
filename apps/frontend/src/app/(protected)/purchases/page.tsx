"use client";

import React, { useEffect, useState } from "react";
import {
  getPurchaseOrders,
  createPurchaseOrder,
  
} from "@/lib/api/purchases/purchaseOrders";
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

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [ordersData, suppliersData, productsData, categoriesData] =
      await Promise.all([
        getPurchaseOrders(),
        getSuppliers(),
        getProducts(),
        getCategories(),
      ]);

    setOrders(ordersData);
    setSuppliers(suppliersData);
    setProducts(productsData.data);
    setCategories(categoriesData);
  };

  const handleCreateOrder = async (payload: CreatePurchaseOrderDto) => {
    try {
      await createPurchaseOrder(payload);
      fetchData(); // Refrescar lista de órdenes
    } catch (error: any) {
      alert(
        "Error creando orden: " + (error?.response?.data?.message || "Error")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black max-w-7xl mx-auto px-6 py-10">
      {/* Título + Upload agrupados y con margen abajo */}
      <div className="mb-10 flex justify-between  gap-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
          Gestión de Órdenes de Compra
        </h1>

        
      </div>

      {/* Formulario y tabla en flex-column con gap */}
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
    </div>
  );
}
