// app/(protected)/sales/page.tsx

"use client";

import { useEffect, useState } from "react";
import SalesForm from "@/components/productSales/productSalesFrom";
import { SalesTable } from "@/components/productSales/productSalesTable";
import { SaleI, CreateSaleDto } from "@/types/productSales";
import { ProductI, Category, UnitOfMeasure } from "@/types/product";
import { Customer } from "@/types/customer";
import {
  getSales,
  createSale,
} from "@/lib/api/sales/productSales";
import { getProducts } from "@/lib/api/products/products";
import { getCategories } from "@/lib/api/products/categories";
import { getUnitsOfMeasure } from "@/lib/api/products/unitOfMeasures";
import { getCustomers } from "@/lib/api/sales/customers";


export default function SalesPage() {
  const [sales, setSales] = useState<SaleI[]>([]);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [
          salesData,
          productsData,
          categoriesData,
          unitsData,
          customersData,
        ] = await Promise.all([
          getSales(),
          getProducts(),
          getCategories(),
          getUnitsOfMeasure(),
          getCustomers(),
        ]);
        setSales(salesData);
        setProducts(productsData);
        setCategories(categoriesData);
        setUnits(unitsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Aquí el formulario envía CreateSaleDto
  // Pero puede enviar status con valores frontend (ejemplo: "completed")
  // Así que mapeamos antes de enviar al backend
  const handleSaleCreated = async (data: CreateSaleDto) => {
    try {
      setSaving(true);
   
      // Mapear status frontend a backend
      const statusMap: Record<string, CreateSaleDto["status"]> = {
        pending: "pending",
        completed: "paid",
        canceled: "cancelled",
      };

      const backendData: CreateSaleDto = {
          
        ...data,
        status: statusMap[data.status] || data.status,
      };
        console.log("Payload a enviar:", backendData);
      const createdSale = await createSale(backendData);
      setSales((prev) => [createdSale, ...prev]);
    
      alert("Venta creada con éxito");
    } catch (error: any) {
 console.error("Error al guardar la venta:", error.response?.data || error.message);
      alert("Error al crear la venta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Ventas</h1>

      <SalesForm
        products={products}
        categories={categories}
        units={units}
        customers={customers}
        onCreate={handleSaleCreated}
      />

      <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
        <SalesTable sales={sales} products={products} loading={loading} />
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-xl">
          Guardando venta...
        </div>
      )}
    </div>
  );
}
