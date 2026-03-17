import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { groupsTable, memberGroupsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/groups", async (_req, res) => {
    const groups = await db.select().from(groupsTable).orderBy(groupsTable.createdAt);
    res.json(
        groups.map((g) => ({
            id: g.id,
            name: g.name,
            color: g.color,
            createdAt: g.createdAt.toISOString(),
            updatedAt: g.updatedAt.toISOString(),
        })),
    );
});

router.post("/groups", async (req, res) => {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: "name is required" });
    }
    const [group] = await db
        .insert(groupsTable)
        .values({
            id: randomUUID(),
            name: name.trim(),
            color: color?.trim() || null,
        })
        .returning();

    res.status(201).json({
        id: group.id,
        name: group.name,
        color: group.color,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
    });
});

router.put("/groups/:id", async (req, res) => {
    const { name, color } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (color !== undefined) updates.color = color?.trim() || null;
    updates.updatedAt = new Date();

    const [group] = await db
        .update(groupsTable)
        .set(updates)
        .where(eq(groupsTable.id, req.params.id))
        .returning();

    if (!group) return res.status(404).json({ error: "Group not found" });

    res.json({
        id: group.id,
        name: group.name,
        color: group.color,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
    });
});

router.delete("/groups/:id", async (req, res) => {
    const id = req.params.id;
    // Remove all links from members to this group
    await db.delete(memberGroupsTable).where(eq(memberGroupsTable.groupId, id));
    // Delete the group itself
    await db.delete(groupsTable).where(eq(groupsTable.id, id));
    res.status(204).send();
});

export default router;