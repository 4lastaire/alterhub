import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const membersTable = pgTable("members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  pronouns: text("pronouns"),
  description: text("description"),
  color: text("color").notNull().default("#4CAF50"),
  avatarUrl: text("avatar_url"),
  folder: text("folder"),
  isFronting: boolean("is_fronting").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMemberSchema = createInsertSchema(membersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof membersTable.$inferSelect;
