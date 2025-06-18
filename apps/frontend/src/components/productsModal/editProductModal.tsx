"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useWatch } from "react-hook-form";
import { ProductI, Category, Brand, UnitOfMeasure } from "@/types/product";
import { updateProduct } from "@/lib/api/products/products";
import { ProductSchema } from "@/lib/schemas/productSchema";

type ProductFormValues = z.infer<typeof ProductSchema>;

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
      internal_code: "",
      sale_price: 0,
      purchase_price: 0,
      min_stock: 0,
      max_stock: 0,
      localityId: "",
      categoryId: "",
      brandId: "",
      unitOfMeasureId: "",
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const filteredLocalities = localities.filter(
    (loc) => String(loc.categoryId) === selectedCategoryId
  );

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        internal_code: product.internal_code || "",
        sale_price: Number(product.sale_price || 0),
        purchase_price: Number(product.purchase_price || 0),
        min_stock: Number(product.min_stock || 0),
        max_stock: Number(product.max_stock || 0),
        localityId: String(product.locality?.id || ""),
        categoryId: String(product.category?.id || ""),
        brandId: String(product.brand?.id || ""),
        unitOfMeasureId: String(product.unit_of_measure?.id || ""),
      });
    } else {
      form.reset();
    }
  }, [product, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, unitRes, locRes] = await Promise.all([
          fetch("http://localhost:3001/api/categories", {
            credentials: "include",
          }),
          fetch("http://localhost:3001/api/brands", {
            credentials: "include",
          }),
          fetch("http://localhost:3001/api/units", {
            credentials: "include",
          }),
          fetch("http://localhost:3001/api/localities", {
            credentials: "include",
          }),
        ]);

        const [catData, brandData, unitData, locData] = await Promise.all([
          catRes.json(),
          brandRes.json(),
          unitRes.json(),
          locRes.json(),
        ]);

        setCategories(catData);
        setBrands(brandData);
        setUnits(unitData);
        setLocalities(locData);
      } catch (err) {
        console.error("Error al cargar datos relacionados:", err);
        addToast({
          title: "Error de carga",
          description:
            "No se pudieron cargar categorías, marcas o unidades. Revisa tu sesión.",
          color: "danger",
          variant: "bordered",
        });
      }
    };

    if (open) {
      fetchData();
    }
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
      <DialogContent className="bg-background text-foreground max-w-3xl w-full rounded-2xl shadow-xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Editar producto
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["name", "Nombre del producto", "text"],
                ["internal_code", "Código interno", "text"],
                ["sale_price", "Precio de venta", "number"],
                ["purchase_price", "Precio de compra", "number"],
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
                              ? ""
                              : field.value ?? ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              type === "number"
                                ? e.target.value === ""
                                  ? null
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
              <FormField
                control={form.control}
                name="localityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación en almacén</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una ubicación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredLocalities.length > 0 ? (
                          filteredLocalities.map((loc) => (
                            <SelectItem key={loc.id} value={String(loc.id)}>
                              {loc.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-400">
                            No hay ubicaciones para esta categoría
                          </div>
                        )}
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
              <Button
                color="success"
                variant="solid"
                onPress={() => form.handleSubmit(onSubmit)()}
                type="button"
              >
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
