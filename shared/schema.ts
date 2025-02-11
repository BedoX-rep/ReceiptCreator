import { pgTable, text, serial, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull()
});

// Receipt schema
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  rightEye: jsonb("right_eye").notNull(),
  leftEye: jsonb("left_eye").notNull(),
  items: jsonb("items").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 5, scale: 2 }).notNull(),
  numericalDiscount: numeric("numerical_discount", { precision: 10, scale: 2 }).notNull(),
  advancePayment: numeric("advance_payment", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  balanceDue: numeric("balance_due", { precision: 10, scale: 2 }).notNull()
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertReceiptSchema = createInsertSchema(receipts).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export const prescriptionSchema = z.object({
  sph: z.string(),
  cyl: z.string(),
  axe: z.string()
});

export const receiptItemSchema = z.object({
  product: z.string(),
  quantity: z.number(),
  price: z.number(),
  total: z.number()
});

export type PrescriptionData = z.infer<typeof prescriptionSchema>;
export type ReceiptItem = z.infer<typeof receiptItemSchema>;
