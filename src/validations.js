import { z } from "zod";

/**
 * Report validation schema using Zod
 * - Title: 3–80 characters
 * - Description: At least 20 characters
 * - Type: 'lost' or 'found'
 * - Category: Required
 * - Date: Required, not in the future
 * - Location: Required text
 * - itemCurrentLocation: Optional (where item is now for found reports)
 */
export const reportSchema = z.object({
  type: z.enum(["lost", "found"], {
    errorMap: () => ({ message: "Please specify whether the item is Lost or Found" }),
  }),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(80, "Title cannot exceed 80 characters"),
  category: z
    .string()
    .min(1, "Please select an item category")
    .refine((val) => val !== "All Categories", {
      message: "Please choose a specific item category",
    }),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters to help others identify the item"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine(
      (val) => {
        const selected = new Date(val);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return !isNaN(selected.getTime()) && selected <= today;
      },
      { message: "Date cannot be in the future" }
    ),
  location: z
    .string()
    .min(3, "Please provide the city, street or landmark where lost/found"),
  itemCurrentLocation: z.string().optional(),
  images: z.any().optional(),
});

export default reportSchema;
