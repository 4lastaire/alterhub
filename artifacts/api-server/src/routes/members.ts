import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { membersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/members", async (_req, res) => {
  const members = await db.select().from(membersTable).orderBy(membersTable.createdAt);
  res.json(members.map(formatMember));
});

router.post("/members", async (req, res) => {
  const { name, pronouns, description, color, avatarUrl } = req.body;
  if (!name || !color) {
    return res.status(400).json({ error: "name and color are required" });
  }
  const id = randomUUID();
  const [member] = await db.insert(membersTable).values({
    id,
    name,
    pronouns: pronouns || null,
    description: description || null,
    color,
    avatarUrl: avatarUrl || null,
    isFronting: false,
  }).returning();
  res.status(201).json(formatMember(member));
});

router.get("/members/:id", async (req, res) => {
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, req.params.id));
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(formatMember(member));
});

router.put("/members/:id", async (req, res) => {
  const { name, pronouns, description, color, avatarUrl } = req.body;
  const [member] = await db
    .update(membersTable)
    .set({
      ...(name !== undefined && { name }),
      ...(pronouns !== undefined && { pronouns }),
      ...(description !== undefined && { description }),
      ...(color !== undefined && { color }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      updatedAt: new Date(),
    })
    .where(eq(membersTable.id, req.params.id))
    .returning();
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(formatMember(member));
});

router.delete("/members/:id", async (req, res) => {
  await db.delete(membersTable).where(eq(membersTable.id, req.params.id));
  res.status(204).send();
});

function formatMember(m: typeof membersTable.$inferSelect) {
  return {
    id: m.id,
    name: m.name,
    pronouns: m.pronouns,
    description: m.description,
    color: m.color,
    avatarUrl: m.avatarUrl,
    isFronting: m.isFronting,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

export default router;
