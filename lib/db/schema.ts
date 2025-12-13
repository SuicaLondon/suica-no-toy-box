import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const companies = pgTable(
  "Company",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    county: text("county").notNull(),
    type: text("type").notNull(),
    rate: text("rate").notNull(),
    hasUrl: boolean("hasUrl"),
    url: text("url"),
    description: text("description"),
    values: text("values"),
    businessModel: text("businessModel"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [index("Company_name_idx").on(table.name)],
);

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
