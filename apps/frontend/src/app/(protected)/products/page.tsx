"use client";

import { useEffect, useState } from "react";
import { ProductI } from "@/types/product";
import { getProducts, deleteProduct } from "@/lib/api/products/products";
import ProductTable from "@/components/productsModal/productTable";
import { CreateProductModal } from "@/components/productsModal/createProductModal";
import EditProductModal from "@/components/productsModal/editProductModal";
import DeleteProductModal from "@/components/productsModal/deleteProductModal";
import ProductDetailsModal from "@/components/productsModal/viewProductModal";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/button";
import { Search, Filter, Settings2, PlusCircle, Box } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { productColumnOptions } from "@/constants/productColumns";
import { addToast } from "@heroui/react";

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

  const [visibleColumns, setVisibleColumns] = useState<
    Record<keyof ProductI, boolean>
  >(() => {
    const initial: Record<keyof ProductI, boolean> = {} as any;
    productColumnOptions.forEach(({ key }) => {
      initial[key] = [
        "name",
        "locality",
        "category",
        "current_quantity",
        "brand",
        "unit_of_measure",
        "sale_price",
        "isActive",
      ].includes(key);
    });
    return initial;
  });

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const fullText = `${product.name} ${product.category?.name ?? ""} ${
      product.brand?.name ?? ""
    }`.toLowerCase();
    const matchesSearch = fullText.includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category?.name?.toLowerCase() ?? "");
    return matchesSearch && matchesCategory;
  });

  const handleBulkDelete = async () => {
    await Promise.all(
      selectedProducts.map((id) => deleteProduct(id.toString()))
    );
    setSelectedProducts([]);
    fetchProducts();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
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
    <div className="p-6 min-h-screen dark:bg-gray-900 bg-gray-100 text-gray-900">
      <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold dark:text-white   flex items-center gap-2">
          <Box className="w-6 h-6 text-green-600" />
          Gestión de Productos
        </h1>
        <Button
          onPress={() => setShowCreateModal(true)}
          className="bg-green-600/20 text-green-400 hover:bg-green-600/30 hover:text-green-300 border-green-600/30 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Crear Producto
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 max-w-6xl mx-auto">
        <div className="relative w-full sm:w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 pl-10 pr-4 py-2 rounded"
          />
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
              {["ferretería", "eléctrico", "plomería"].map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
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
          products={filteredProducts}
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
        }}
        product={selectedProduct}
        multiple={bulkDeleteMode}
        onDelete={fetchProducts}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
