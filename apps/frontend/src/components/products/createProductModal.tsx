"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { addToast } from "@heroui/react";
import { ProductSchema } from "@/lib/schemas/productSchema";
import { createProduct } from "@/lib/api/products/products";
import { z } from "zod";

type ProductFormValues = z.infer<typeof ProductSchema>;

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProductModal = ({
  open,
  onClose,
  onSuccess,
}: CreateProductModalProps) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      brandId: "",
      internal_code: "",
      image: "",
      min_stock: 0,
      max_stock: 0,
      unitOfMeasureId: "",
      isPerishable: false,
      expiration_date: "",
      notes: "",
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      form.reset();
      return;
    }

    const fetchData = async () => {
      try {
        const [catRes, brandRes, unitRes] = await Promise.all([
          fetch("http://localhost:3001/api/categories", {
            credentials: "include",
          }),
          fetch("http://localhost:3001/api/brands", {
            credentials: "include",
          }),
          fetch("http://localhost:3001/api/units", {
            credentials: "include",
          }),
        ]);
        if (!catRes.ok || !brandRes.ok || !unitRes.ok) throw new Error();

        const catData: Category[] = await catRes.json();
        const brandData: Brand[] = await brandRes.json();
        const unitData: Unit[] = await unitRes.json();

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

    fetchData();
  }, [open, form]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const cleaned = {
        ...data,
        expiration_date: data.expiration_date || undefined,
      };

      const responseBody = await createProduct(cleaned);
      console.log("Respuesta del servidor:", responseBody);

      addToast({
        title: "Producto creado",
        description: "El producto fue registrado exitosamente",
        variant: "bordered",
        color: "success",
      });

      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error al crear producto:", error);
      addToast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "bordered",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearZeroOnFocus =
    (field: { value: number | string; onChange: (value: string) => void }) =>
    () => {
      if (field.value === 0) field.onChange("");
    };

  const isPerishable = form.watch("isPerishable");

  return (
    <Modal
      isOpen={open}
      onOpenChange={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="bg-white dark:bg-gray-600 dark:text-white">
        <ModalHeader>Crear nuevo producto</ModalHeader>
        <ModalBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2 md:p-4"
            >
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select
                      popoverProps={{
                        className: "dark:bg-neutral-800 dark:text-white",
                      }}
                      selectedKeys={
                        field.value ? new Set([field.value]) : new Set()
                      }
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0] || "")
                      }
                    >
                      {categories.map((cat) => (
                        <SelectItem key={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Marca */}
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca *</FormLabel>
                    <Select
                      popoverProps={{
                        className: "dark:bg-neutral-800 dark:text-white",
                      }}
                      selectedKeys={
                        field.value ? new Set([field.value]) : new Set()
                      }
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0] || "")
                      }
                    >
                      {brands.map((brand) => (
                        <SelectItem key={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unidad */}
              <FormField
                control={form.control}
                name="unitOfMeasureId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida *</FormLabel>
                    <Select
                      popoverProps={{
                        className: "dark:bg-neutral-800 dark:text-white",
                      }}
                      selectedKeys={
                        field.value ? new Set([field.value]) : new Set()
                      }
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0] || "")
                      }
                    >
                      {units.map((unit) => (
                        <SelectItem key={unit.id}>{unit.name}</SelectItem>
                      ))}
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Código interno */}
              <FormField
                control={form.control}
                name="internal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código interno</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Imagen */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen (URL)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stocks */}
              {(["min_stock", "max_stock"] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {name === "min_stock"
                          ? "Stock mínimo *"
                          : "Stock máximo *"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onFocus={clearZeroOnFocus(field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* Perecedero */}
              <FormField
                control={form.control}
                name="isPerishable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Es perecedero?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      >
                        Sí
                      </Switch>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha de vencimiento */}
              {isPerishable && (
                <FormField
                  control={form.control}
                  name="expiration_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de vencimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Notas */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Footer */}
              <ModalFooter className="md:col-span-2 flex gap-2 justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  color="success"
                  variant="bordered"
                >
                  {loading ? "Creando..." : "Crear"}
                </Button>
                <Button onPress={onClose} color="danger" variant="bordered">
                  Cancelar
                </Button>
              </ModalFooter>
            </form>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
