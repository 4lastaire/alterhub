import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const groupsTable = pgTable("groups", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    name: text("name").notNull().unique(),
    color: text("color"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const memberGroupsTable = pgTable(
    "member_groups",
    {
        memberId: text("member_id").notNull(),
        groupId: text("group_id").notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.memberId, t.groupId] }),
    }),
);