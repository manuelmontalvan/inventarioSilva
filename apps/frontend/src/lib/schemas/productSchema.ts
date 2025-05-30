import { z } from 'zod';

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

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  barcode: z.string(),
  internal_code: z.string().optional(),
  image: z.string().url().optional(),
  current_quantity: z.number().nonnegative(),
  min_stock: z.number().nonnegative(),
  max_stock: z.number().nonnegative(),
  warehouse_location: z.string().optional(),
  purchase_price: z.number().nonnegative(),
  sale_price: z.number().nonnegative(),
  profit_margin: z.number(),
  taxes: z.number(),
  discount: z.number().optional(),
  entry_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  last_updated: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  last_purchase_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
  last_sale_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
  sales_frequency: z.number().nonnegative(),
  isActive: z.boolean(),
  isPerishable: z.boolean(),
  expiration_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
  notes: z.string().optional(),
  current_trend: z.enum(['growing', 'declining', 'stable']).optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
    categoryId: z.string().min(1),
  brandId: z.string().min(1),
  unitOfMeasureId: z.string().min(1),
});
