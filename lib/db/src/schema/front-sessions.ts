import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const frontSessionsTable = pgTable("front_sessions", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull(),
  memberName: text("member_name").notNull(),
  memberColor: text("member_color").notNull(),
  memberAvatarUrl: text("member_avatar_url"),
  customStatus: text("custom_status"),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertFrontSessionSchema = createInsertSchema(frontSessionsTable).omit({
  startTime: true,
});

export type InsertFrontSession = z.infer<typeof insertFrontSessionSchema>;
export type FrontSession = typeof frontSessionsTable.$inferSelect;
