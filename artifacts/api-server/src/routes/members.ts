import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  membersTable,
  groupsTable,
  memberGroupsTable,
} from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// GET /api/members — list all members with their groups
router.get("/members", async (_req, res) => {
  const members = await db
      .select()
      .from(membersTable)
      .orderBy(membersTable.createdAt);

  const memberIds = members.map((m) => m.id);

  // Load all links from members to groups
  const links =
      memberIds.length > 0
          ? await db
              .select()
              .from(memberGroupsTable)
              .where(inArray(memberGroupsTable.memberId, memberIds))
          : [];

  const groupIds = Array.from(new Set(links.map((l) => l.groupId)));

  const groups =
      groupIds.length > 0
          ? await db
              .select()
              .from(groupsTable)
              .where(inArray(groupsTable.id, groupIds))
          : [];

  const groupsById = new Map(
      groups.map((g) => [
        g.id,
        {
          id: g.id,
          name: g.name,
          color: g.color,
        },
      ]),
  );

  const memberGroups = new Map<
      string,
      { id: string; name: string; color?: string | null }[]
  >();

  for (const link of links) {
    const g = groupsById.get(link.groupId);
    if (!g) continue;
    const list = memberGroups.get(link.memberId) ?? [];
    list.push(g);
    memberGroups.set(link.memberId, list);
  }

  res.json(
      members.map((m) => ({
        ...formatMember(m),
        groups: memberGroups.get(m.id) ?? [],
      })),
  );
});

// POST /api/members — create a member + optional groups
router.post("/members", async (req, res) => {
  const { name, pronouns, description, color, avatarUrl, groupIds } = req.body;
  if (!name || !color) {
    return res
        .status(400)
        .json({ error: "name and color are required" });
  }

  const id = randomUUID();

  const [member] = await db
      .insert(membersTable)
      .values({
        id,
        name,
        pronouns: pronouns || null,
        description: description || null,
        color,
        avatarUrl: avatarUrl || null,
        isFronting: false,
      })
      .returning();

  if (Array.isArray(groupIds) && groupIds.length > 0) {
    await db.insert(memberGroupsTable).values(
        groupIds.map((gid: string) => ({
          memberId: id,
          groupId: gid,
        })),
    );
  }

  // Attach groups to the response
  const groups = await loadMemberGroups(id);

  res.status(201).json({
    ...formatMember(member),
    groups,
  });
});

// GET /api/members/:id — single member with groups
router.get("/members/:id", async (req, res) => {
  const [member] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.id, req.params.id));
  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  const groups = await loadMemberGroups(member.id);

  res.json({
    ...formatMember(member),
    groups,
  });
});

// PUT /api/members/:id — update member + groups
router.put("/members/:id", async (req, res) => {
  const { name, pronouns, description, color, avatarUrl, groupIds } = req.body;

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (name !== undefined) updates.name = name;
  if (pronouns !== undefined) updates.pronouns = pronouns;
  if (description !== undefined) updates.description = description;
  if (color !== undefined) updates.color = color;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  const memberId = req.params.id;

  const [member] = await db
      .update(membersTable)
      .set(updates)
      .where(eq(membersTable.id, memberId))
      .returning();

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  // If groupIds is provided, replace the join rows
  if (Array.isArray(groupIds)) {
    await db
        .delete(memberGroupsTable)
        .where(eq(memberGroupsTable.memberId, memberId));

    if (groupIds.length > 0) {
      await db.insert(memberGroupsTable).values(
          groupIds.map((gid: string) => ({
            memberId,
            groupId: gid,
          })),
      );
    }
  }

  const groups = await loadMemberGroups(memberId);

  res.json({
    ...formatMember(member),
    groups,
  });
});

// DELETE /api/members/:id — delete member + its group links
router.delete("/members/:id", async (req, res) => {
  const memberId = req.params.id;

  await db
      .delete(memberGroupsTable)
      .where(eq(memberGroupsTable.memberId, memberId));

  await db
      .delete(membersTable)
      .where(eq(membersTable.id, memberId));

  res.status(204).send();
});

// Helper: load groups for a member
async function loadMemberGroups(memberId: string) {
  const links = await db
      .select()
      .from(memberGroupsTable)
      .where(eq(memberGroupsTable.memberId, memberId));

  if (!links.length) return [];

  const groupIds = links.map((l) => l.groupId);
  const groups = await db
      .select()
      .from(groupsTable)
      .where(inArray(groupsTable.id, groupIds));

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    color: g.color,
  }));
}

// Shape a DB row into the public member format
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