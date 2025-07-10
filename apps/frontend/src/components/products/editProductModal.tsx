"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Button } from "@heroui/button";
import { addToast } from "@heroui/react";
import { ProductI, Category, Brand, UnitOfMeasure } from "@/types/product";
import { updateProduct } from "@/lib/api/products/products";
import { ProductSchema, ProductFormValues } from "@/lib/schemas/productSchema";
import { getCategories } from "@/lib/api/products/categories";
import { getBrands } from "@/lib/api/products/brands";
import { getUnitsOfMeasure } from "@/lib/api/products/unitOfMeasures";

interface Props {
  product: ProductI | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (product: ProductI) => void;
}

export default function EditProductModal({
  product,
  open,
  onClose,
  onUpdated,
}: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      internal_code: "",
      min_stock: 0,
      max_stock: 0,
      categoryId: "",
      brandId: "",
      unitOfMeasureId: "",
      purchase_price: 0,
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        internal_code: product.internal_code || "",
        min_stock: Number(product.min_stock || 0),
        max_stock: Number(product.max_stock || 0),
        categoryId: String(product.category?.id || ""),
        brandId: String(product.brand?.id || ""),
        unitOfMeasureId: String(product.unit_of_measure?.id || ""),
        purchase_price: Number(product.purchase_price || 0),
      });
    } else {
      form.reset();
    }
  }, [product, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejecutar las 3 llamadas paralelas usando las funciones Axios
        const [catData, brandData, unitData] = await Promise.all([
          getCategories(),
          getBrands(),
          getUnitsOfMeasure(),
        ]);

        setCategories(catData);
        setBrands(brandData);
        setUnits(unitData);
      } catch {
        addToast({
          title: "Error",
          description: "No se pudieron cargar categorías, marcas o unidades",
          variant: "bordered",
          color: "danger",
        });
      }
    };

    if (open) fetchData();
  }, [open]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!product) {
      addToast({
        title: "Error",
        description: "No se encontró el producto a actualizar.",
        color: "danger",
      });
      return;
    }

    try {
      await updateProduct(product.id, data);
      addToast({
        title: "Actualizado",
        description: "Producto actualizado correctamente.",
        color: "success",
      });
      onUpdated({ ...product, ...data });
      onClose();
    } catch (error) {
      console.error("Error actualizando:", error);
      addToast({
        title: "Error",
        description: "No se pudo actualizar el producto.",
        color: "danger",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=" text-foreground  max-w-3xl w-full rounded-2xl shadow-xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Editar producto
          </DialogTitle>
          <DialogDescription>
            Actualice los neuvos datos del producto
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["name", "Nombre del producto", "text"],
                ["description", "Descripcion del producto", "text"],
                ["internal_code", "Código interno", "text"],
                ["min_stock", "Stock mínimo", "number"],
                ["max_stock", "Stock máximo", "number"],
              ].map(([name, label, type]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof ProductFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type={type}
                          placeholder={label}
                          value={
                            typeof field.value === "boolean"
                              ? field.value.toString()
                              : field.value ?? ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              type === "number"
                                ? e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                                : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de compra</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Precio de compra"
                        value={
                          field.value !== undefined && field.value !== null
                            ? String(field.value)
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una marca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfMeasureId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex justify-end gap-3 pt-4">
              <Button variant="bordered" color="danger" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="success" variant="solid" type="submit">
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
