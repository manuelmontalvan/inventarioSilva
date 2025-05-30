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
import { Button } from "@heroui/button"; // <- Igual al EditUserModal
import { addToast } from "@heroui/react";

import { ProductI } from "@/types/product";
import { updateProduct } from "@/lib/api/products";
import { Category, Brand, UnitOfMeasure } from "@/types/product";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  barcode: z.string().min(1, "El código es obligatorio"),
  sale_price: z.coerce.number().nonnegative("Debe ser un precio válido"),
  categoryId: z.number(),
  brandId: z.number(),
  unitOfMeasureId: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      barcode: "",
      sale_price: 0,
      categoryId: undefined,
      brandId: undefined,
      unitOfMeasureId: undefined,
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        barcode: product.barcode,
        sale_price: product.sale_price,
        categoryId: Number(product.category?.id),
        brandId: Number(product.brand?.id),
        unitOfMeasureId: Number(product.unit_of_measure?.id),
      });
    }
  }, [product, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, unitRes] = await Promise.all([
          fetch("http://localhost:3001/api/categories"),
          fetch("http://localhost:3001/api/brands"),
          fetch("http://localhost:3001/api/units"),
        ]);

        const [catData, brandData, unitData] = await Promise.all([
          catRes.json(),
          brandRes.json(),
          unitRes.json(),
        ]);

        setCategories(catData);
        setBrands(brandData);
        setUnits(unitData);
      } catch (err) {
        console.error("Error al cargar datos relacionados:", err);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!product) return;

    try {
      await updateProduct(product.id, values);
      addToast({
        title: "Producto actualizado",
        description: "Los datos del producto fueron actualizados exitosamente.",
        color: "success",
      });
      onUpdated({ ...product, ...values });
      onClose();
    } catch (error) {
      console.error("Error actualizando producto:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          bg-gradient-to-br from-gray-900 via-purple-900 to-black 
          border border-white/10 text-white shadow-lg 
          max-w-2xl w-full mx-4 sm:mx-auto
          p-6 sm:p-8
        "
      >
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre del producto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de barras</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Código de barras" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de venta</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="Precio de venta"
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
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={String(field.value)}
                    >
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
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={String(field.value)}
                    >
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
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={String(field.value)}
                    >
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
          </form>
        </Form>

        <DialogFooter className="pt-4">
          <Button variant="bordered" color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="success"
            variant="bordered"
            onPress={() => form.handleSubmit(onSubmit)()}
            type="button"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
