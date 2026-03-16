import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { frontSessionsTable, membersTable } from "@workspace/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/fronters", async (_req, res) => {
  const sessions = await db
    .select()
    .from(frontSessionsTable)
    .where(eq(frontSessionsTable.isActive, true))
    .orderBy(desc(frontSessionsTable.startTime));
  res.json(sessions.map(formatSession));
});

router.post("/fronters", async (req, res) => {
  const { memberId, customStatus } = req.body;
  if (!memberId) return res.status(400).json({ error: "memberId is required" });

  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, memberId));
  if (!member) return res.status(404).json({ error: "Member not found" });

  const id = randomUUID();
  const [session] = await db.insert(frontSessionsTable).values({
    id,
    memberId,
    memberName: member.name,
    memberColor: member.color,
    memberAvatarUrl: member.avatarUrl,
    customStatus: customStatus || null,
    isActive: true,
  }).returning();

  await db.update(membersTable).set({ isFronting: true }).where(eq(membersTable.id, memberId));

  res.status(201).json(formatSession(session));
});

router.delete("/fronters/:id", async (req, res) => {
  const [session] = await db
    .update(frontSessionsTable)
    .set({ isActive: false, endTime: new Date() })
    .where(eq(frontSessionsTable.id, req.params.id))
    .returning();
  if (!session) return res.status(404).json({ error: "Session not found" });

  const stillFronting = await db
    .select()
    .from(frontSessionsTable)
    .where(
      and(
        eq(frontSessionsTable.memberId, session.memberId),
        eq(frontSessionsTable.isActive, true)
      )
    );

  if (stillFronting.length === 0) {
    await db.update(membersTable).set({ isFronting: false }).where(eq(membersTable.id, session.memberId));
  }

  res.json(formatSession(session));
});

router.patch("/fronters/:id/status", async (req, res) => {
  const { customStatus } = req.body;
  const [session] = await db
    .update(frontSessionsTable)
    .set({ customStatus })
    .where(eq(frontSessionsTable.id, req.params.id))
    .returning();
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(formatSession(session));
});

router.get("/front-history", async (req, res) => {
  const { startDate, endDate } = req.query;
  let query = db.select().from(frontSessionsTable);
  
  const conditions = [];
  if (startDate) {
    conditions.push(gte(frontSessionsTable.startTime, new Date(startDate as string)));
  }
  if (endDate) {
    const end = new Date(endDate as string);
    end.setDate(end.getDate() + 1);
    conditions.push(lte(frontSessionsTable.startTime, end));
  }

  const sessions = conditions.length > 0
    ? await db.select().from(frontSessionsTable).where(and(...conditions)).orderBy(desc(frontSessionsTable.startTime))
    : await db.select().from(frontSessionsTable).orderBy(desc(frontSessionsTable.startTime)).limit(500);

  res.json(sessions.map(formatSession));
});

function formatSession(s: typeof frontSessionsTable.$inferSelect) {
  return {
    id: s.id,
    memberId: s.memberId,
    memberName: s.memberName,
    memberColor: s.memberColor,
    memberAvatarUrl: s.memberAvatarUrl,
    customStatus: s.customStatus,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime?.toISOString() ?? null,
    isActive: s.isActive,
  };
}

export default router;
