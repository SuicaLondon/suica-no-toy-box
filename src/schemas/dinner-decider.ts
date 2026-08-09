import * as z from "zod";

export const cuisineSchema = z.object({
  cuisine: z.string().trim().min(1, "Please enter a cuisine"),
});

export type CuisineFormValues = z.infer<typeof cuisineSchema>;
