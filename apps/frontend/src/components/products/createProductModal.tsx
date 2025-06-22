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
import { z } from "zod";
import { useWatch } from "react-hook-form";
import { ProductSchema } from "@/lib/schemas/productSchema";




type ProductFormValues = z.infer<typeof ProductSchema>;

/* ----------  Props del Modal  ---------- */
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
  /* ----------  React-Hook-Form  ---------- */
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
      localityId: "",
      unitOfMeasureId: "",
      purchase_price: 0,
      sale_price: 0,
      isPerishable: false,
      expiration_date: "",
      notes: "",
    },
  });

  /* ----------  Catálogos  ---------- */
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localities, setLocalities] = useState<any[]>([]);
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });

  const [filteredLocalities, setFilteredLocalities] = useState<any[]>([]);

  /* ----------  Fetch catálogos  ---------- */
  useEffect(() => {
    if (!open) {
      // Cuando se cierra el modal, resetea formulario
      form.reset();
      return;
    }

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
        if (!catRes.ok || !brandRes.ok || !unitRes.ok || !locRes.ok)
          throw new Error();
        setCategories(await catRes.json());
        setBrands(await brandRes.json());
        setUnits(await unitRes.json());
        setLocalities(await locRes.json());
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

  useEffect(() => {
    const filtered = localities.filter(
      (loc) => loc.category?.id === selectedCategoryId
    );
    setFilteredLocalities(filtered);
    // Limpia selección previa si no es válida
    if (!filtered.some((l) => l.id === form.getValues("localityId"))) {
      form.setValue("localityId", "");
    }
  }, [selectedCategoryId, localities]);
  /* ----------  Envío del formulario  ---------- */
  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const cleaned = {
        ...data,
        expiration_date: data.expiration_date || undefined,
      };

      const res = await fetch("http://localhost:3001/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleaned),
      });
      const responseBody = await res.json();
console.log("Respuesta del servidor:", responseBody);
      if (!res.ok) throw new Error();

      addToast({
        title: "Producto creado",
        description: "El producto fue registrado exitosamente",
        variant: "bordered",
        color: "success",
      });

      onSuccess();
      onClose();
      form.reset(); // ← Limpia al crear
    } catch {
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

  /* ----------  Helper: limpia '0' al focus  ---------- */
  const clearZeroOnFocus = (field: any) => () => {
    if (field.value === 0) field.onChange("");
  };

  const isPerishable = form.watch("isPerishable");

  /* ----------  Render  ---------- */
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

              {/* Ubicación */}
              <FormField
                control={form.control}
                name="localityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación en almacén *</FormLabel>
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
                      isDisabled={filteredLocalities.length === 0}
                    >
                      {filteredLocalities.map((loc) => (
                        <SelectItem key={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Perecedero */}
              <FormField
                control={form.control}
                name="isPerishable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Es perecedero?</FormLabel>
                    <FormControl>
                      <Switch
                        isSelected={field.value}
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
              <ModalFooter className="md:col-span-2">
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
