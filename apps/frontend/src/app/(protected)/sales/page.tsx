"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { useEffect, useState } from "react";
import SalesForm from "@/components/productSales/productSalesFrom";
import { SalesTable } from "@/components/productSales/productSalesTable";
import FileUpload from "@/components/fileUpload";
import { SaleI, CreateSaleDto } from "@/types/productSales";
import { ProductI, Category, UnitOfMeasure } from "@/types/product";
import { Customer } from "@/types/customer";
import {
  getSales,
  createSale,
  importSalesFromExcel,
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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [
          salesData,
          productsResponse,
          categoriesResponse,
          unitsResponse,
          customersResponse,
        ] = await Promise.all([
          getSales(),
          getProducts(),
          getCategories(),
          getUnitsOfMeasure(),
          getCustomers(),
        ]);
        setSales(salesData);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse);
        setUnits(unitsResponse);
        setCustomers(customersResponse);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Función para subir archivo de ventas
  const handleUploadSales = async (file: File) => {
    return await importSalesFromExcel(file);
  };

  // Recarga ventas tras importar archivo
  const onUploadSuccess = () => {
    async function reloadSales() {
      try {
        setLoading(true);
        const salesData = await getSales();
        setSales(salesData);
      } catch (error) {
        console.error("Error recargando ventas:", error);
      } finally {
        setLoading(false);
      }
    }
    reloadSales();
  };

  // Maneja creación de venta desde formulario
  const handleSaleCreated = async (data: CreateSaleDto) => {
    try {
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

      const createdSale = await createSale(backendData);
      setSales((prev) => [createdSale, ...prev]);
   
    } catch (error: unknown) {
      let message = "Error desconocido";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        message = error.response.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      console.error("Error al guardar la venta:", message);
      alert("Error al crear la venta");
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Ventas</h1>
          <div className="w-72">
            <FileUpload uploadFunction={handleUploadSales} onSuccess={onUploadSuccess} />
          </div>
        </div>

        <SalesForm
          categories={categories}
          units={units}
          customers={customers}
          onCreate={handleSaleCreated}
        />

        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
          <SalesTable sales={sales} loading={loading} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
