import { Router, type IRouter } from "express";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { db, activityLogsTable, profilesTable } from "@workspace/db";
import { ListActivityQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/activity", async (req, res): Promise<void> => {
  const parsed = ListActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { profileId, limit = 50 } = parsed.data;

  const query = db
    .select({
      id: activityLogsTable.id,
      profileId: activityLogsTable.profileId,
      profileName: profilesTable.name,
      domain: activityLogsTable.domain,
      wasBlocked: activityLogsTable.wasBlocked,
      timestamp: activityLogsTable.timestamp,
    })
    .from(activityLogsTable)
    .innerJoin(profilesTable, eq(activityLogsTable.profileId, profilesTable.id))
    .orderBy(desc(activityLogsTable.timestamp))
    .limit(limit);

  const logs = profileId
    ? await query.where(eq(activityLogsTable.profileId, profileId))
    : await query;

  res.json(logs);
});

export default router;
