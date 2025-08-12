"use client";
import ProtectedRoute from "@/components/restricted/protectedRoute";
import { useEffect, useState } from "react";
import { ProductI } from "@/types/product";
import { useCallback } from "react";



import {
  getProducts,
  deleteProduct,
  deleteAllProducts,
  uploadProducts,
} from "@/lib/api/products/products";
import { getCategories } from "@/lib/api/products/categories";
import { Category } from "@/types/product";
import ProductTable from "@/components/products/productTable";
import { CreateProductModal } from "@/components/products/createProductModal";
import EditProductModal from "@/components/products/editProductModal";
import DeleteProductModal from "@/components/products/deleteProductModal";
import ProductDetailsModal from "@/components/products/viewProductModal";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/button";
import {
  Search,
  Filter,
  Settings2,
  PlusCircle,
  Box,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { productColumnOptions } from "@/constants/productColumns";
import { addToast } from "@heroui/react";
import FileUpload from "@/components/fileUpload";

export default function ProductAdminPage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductI | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [allDeleteMode, setAllDeleteMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  const [visibleColumns, setVisibleColumns] = useState<
    Record<keyof ProductI, boolean>
  >(() => {
    const initial = Object.fromEntries(
      productColumnOptions.map(({ key }) => [
        key,
        [
          "name",
          "locality",
          "category",
          "current_quantity",
          "brand",
          "unit_of_measure",
          "sale_price",
          "purchase_price",
        ].includes(key),
      ])
    ) as Record<keyof ProductI, boolean>;

    return initial;
  });

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch {
      addToast({ title: "Error cargando categorías", color: "danger" });
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const response = await getProducts({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        categoryIds:
          selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      setProducts(response.data);
      setTotalPages(response.totalPages);
    } catch (err: unknown) {
      console.error("Error al cargar productos", err);
      setError("Error al cargar productos");
      addToast({ title: "Productos no se pudieron cargar", color: "danger" });
    }
  }, [currentPage, searchTerm, selectedCategories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleBulkDelete = async () => {
    try {
      if (selectedProducts.length === 0) {
        await deleteAllProducts();
      } else if (bulkDeleteMode) {
        await Promise.all(
          selectedProducts.map((id) => deleteProduct(id.toString()))
        );
      } else if (selectedProduct) {
        await deleteProduct(selectedProduct.id);
      }
      setSelectedProducts([]);
      fetchProducts();
    } catch (error: unknown) {
      let message = "Error al eliminar productos. Algunos pueden estar en uso.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object" &&
        "data" in (error as any).response &&
        typeof (error as any).response.data === "object" &&
        "message" in (error as any).response.data
      ) {
        message = (error as any).response.data.message;
      }

      addToast({
        title: "Error",
        description: message,
        color: "danger",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Acceso Denegado</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }
  






  return (
    <ProtectedRoute>
      <div className="p-6 min-h-screen dark:bg-gray-900 bg-gray-100 text-gray-900">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 max-w-6xl mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-green-600" />
            Gestión de Productos
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <FileUpload
              uploadFunction={uploadProducts}
              onSuccess={fetchProducts}
            />

            <Button
              onPress={() => setShowCreateModal(true)}
              className="bg-green-600/20 text-green-400 hover:bg-green-600/30 hover:text-green-300 border-green-600/30 flex items-center gap-2 w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4" /> Crear Producto
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 max-w-6xl mx-auto">
          <div className="flex w-full sm:w-auto items-center gap-4 p-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 pl-10 pr-10 py-2 rounded"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                  aria-label="Limpiar búsqueda"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>

            <Button
              onPress={() => {
                setSelectedProduct(null);
                setBulkDeleteMode(true);
                setShowDeleteModal(true);
                setAllDeleteMode(true);
              }}
              className="bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 border-red-600/30 flex items-center gap-2 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" /> Eliminar Todos
            </Button>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700">
                  <Filter className="w-4 h-4 mr-2" /> Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 text-white border-gray-600">
                <DropdownMenuLabel>Filtrar por categoría</DropdownMenuLabel>
                {categories.map(({ id, name }) => (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={selectedCategories.includes(id)}
                    onCheckedChange={() => toggleCategory(id)}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700">
                  <Settings2 className="w-4 h-4 mr-2" /> Columnas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 text-white border-gray-600 max-h-[300px] overflow-y-auto">
                <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
                {productColumnOptions.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns[column.key]}
                    onCheckedChange={() => toggleColumn(column.key)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedProducts.length > 0 && (
            <div className="bg-gray-800 px-3 py-2 rounded text-white flex items-center gap-2">
              <span className="text-sm">
                {selectedProducts.length} seleccionado(s)
              </span>
              <Button
                variant="bordered"
                color="danger"
                onPress={() => {
                  setBulkDeleteMode(true);
                  setSelectedProduct(null);
                  setShowDeleteModal(true);
                }}
              >
                Eliminar
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-md border border-white overflow-hidden bg-gray-900 shadow-lg text-white max-w-6xl mx-auto">
          <ProductTable
            products={products}
            onView={(product) => {
              setSelectedProduct(product);
              setShowDetailsModal(true);
            }}
            onUpdated={(product) => {
              setSelectedProduct(product);
              setShowEditModal(true);
            }}
            onDelete={(product) => {
              setSelectedProduct(product);
              setBulkDeleteMode(false);
              setShowDeleteModal(true);
            }}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            visibleColumns={visibleColumns}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              disabled={currentPage === i + 1}
              className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                currentPage === i + 1
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <ProductDetailsModal
          product={selectedProduct}
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
        <CreateProductModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProducts}
        />
        <EditProductModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={selectedProduct}
          onUpdated={fetchProducts}
        />
        <DeleteProductModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setBulkDeleteMode(false);
            setSelectedProduct(null);
            setAllDeleteMode(false);
          }}
          product={selectedProduct}
          multiple={bulkDeleteMode}
          all={allDeleteMode}
          onDelete={fetchProducts}
          onConfirm={handleBulkDelete}
        />
      </div>
    </ProtectedRoute>
  );
}
