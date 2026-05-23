import { Router, type IRouter } from "express";
import { eq, count, and, gte, sql } from "drizzle-orm";
import { db, profilesTable, blockedSitesTable, activityLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [profileCounts] = await db
    .select({
      totalProfiles: count(),
      activeProfiles: sql<number>`count(*) filter (where ${profilesTable.isActive} = true)`,
    })
    .from(profilesTable);

  const [siteCounts] = await db
    .select({ totalBlockedSites: count() })
    .from(blockedSitesTable)
    .where(eq(blockedSitesTable.isEnabled, true));

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [blocked24h] = await db
    .select({ count: count() })
    .from(activityLogsTable)
    .where(and(eq(activityLogsTable.wasBlocked, true), gte(activityLogsTable.timestamp, yesterday)));

  const categoryCounts = await db
    .select({
      category: blockedSitesTable.category,
      count: count(),
    })
    .from(blockedSitesTable)
    .where(eq(blockedSitesTable.isEnabled, true))
    .groupBy(blockedSitesTable.category)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  res.json({
    totalProfiles: Number(profileCounts?.totalProfiles ?? 0),
    activeProfiles: Number(profileCounts?.activeProfiles ?? 0),
    totalBlockedSites: Number(siteCounts?.totalBlockedSites ?? 0),
    totalBlocked24h: Number(blocked24h?.count ?? 0),
    topBlockedCategories: categoryCounts.map((r) => ({
      category: r.category,
      count: Number(r.count),
    })),
  });
});

export default router;
