import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const UnitOfMeasureSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
});

export const ProductSchema = z
  .object({
    name: z.string().min(1, "Campo obligatorio"),
    description: z.string().optional(),
    categoryId: z.string().uuid("Selecciona una categoría válida"),
    brandId: z.string().uuid("Selecciona una marca válida"),
    internal_code: z.string().optional(),
    image: z
      .string()
      .url("Debe ser una URL válida")
      .or(z.literal(""))
      .optional(),
    min_stock: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
    max_stock: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),

    unitOfMeasureId: z.string().uuid("Selecciona una unidad válida"),
    isPerishable: z.boolean().optional(),
    expiration_date: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.min_stock <= data.max_stock, {
    message: "El stock mínimo no puede ser mayor al máximo",
    path: ["max_stock"],
  });

export type ProductFormValues = z.infer<typeof ProductSchema>;
