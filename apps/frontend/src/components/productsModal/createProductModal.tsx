"use client";
import { ProductI } from "@/types/product";
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { addToast } from "@heroui/react";
import { createProduct } from "@/lib/api/products";
import { ProductSchema } from "@/lib/schemas/productSchema";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (product: ProductI) => void;
}

interface Category {
  id: string;  // <--- id como string
  name: string;
}
interface Brand {
  id: string;  // <--- id como string
  name: string;
}
interface UnitOfMeasure {
  id: string;  // <--- id como string
  name: string;
}

export default function CreateProductModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      barcode: "",
      purchase_price: 0,
      sale_price: 0,
      current_quantity: 0,
      min_stock: 0,
      max_stock: 0,
      warehouse_location: "",
      profit_margin: 0,
      taxes: 0,
      discount: 0,
      isActive: true,
      isPerishable: false,
      expiration_date: "",
      notes: "",
      categoryId: "",
      brandId: "",
      unitOfMeasureId: "",
    },
  });

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

      // Asumimos que vienen con id:string desde API
      setCategories(catData);
      setBrands(brandData);
      setUnits(unitData);
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las listas desplegables.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  const onSubmit = async (data: z.infer<typeof ProductSchema>) => {
    try {
      // expiration_date a undefined si vacía
      if (!data.expiration_date) {
        data.expiration_date = undefined;
      }
      const newProduct = await createProduct(data);
      addToast({
        title: "Producto creado",
        description: "El producto ha sido registrado correctamente.",
        color: "success",
      });
      onCreated(newProduct);
      onClose();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Error al crear producto",
        color: "danger",
      });
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} backdrop="blur" isDismissable={false}>
      <ModalContent
        className="bg-gradient-to-br from-gray-900 via-purple-900 to-black 
          border border-white/10 text-white shadow-lg max-w-full sm:max-w-3xl mx-4 sm:mx-auto max-h-[80vh] overflow-auto"
      >
        <ModalHeader>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-white text-2xl flex items-center gap-2 justify-center">
              Crear Producto
            </h1>
            <p className="text-gray-300 mt-1 max-w-md">
              Completa los datos para registrar un nuevo producto.
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campos de texto, números y checkbox (igual que tu código original) */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Nombre del producto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ... otros inputs iguales ... */}

                {/* Select Categoría */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange} // Recibe string
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Select Marca */}
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <Select
                        onValueChange={field.onChange} // string directo
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Select Unidad de Medida */}
                <FormField
                  control={form.control}
                  name="unitOfMeasureId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de medida</FormLabel>
                      <Select
                        onValueChange={field.onChange} // string directo
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Checkbox isActive */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Activo</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Checkbox isPerishable */}
                <FormField
                  control={form.control}
                  name="isPerishable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Perecedero</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Expiration Date */}
                <FormField
                  control={form.control}
                  name="expiration_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de expiración</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Notas adicionales" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <ModalFooter className="flex justify-end space-x-3">
             <div className="flex flex-wrap justify-end gap-2 mt-4">
              <Button
                onPress={onClose}
                variant="bordered"
                color="danger"
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                variant="bordered"
                color="success"
                onPress={() => form.handleSubmit(onSubmit)()}
                className="flex-1 sm:flex-none"
              >
                Crear
              </Button>
            </div>
              </ModalFooter>
            </form>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
