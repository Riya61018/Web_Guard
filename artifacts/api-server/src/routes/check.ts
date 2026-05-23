import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, blockedSitesTable, activityLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/check", async (req, res): Promise<void> => {
  const { domain, profileId: profileIdRaw } = req.query as Record<string, string>;

  if (!domain || typeof domain !== "string" || domain.trim() === "") {
    res.status(400).json({ error: "domain is required" });
    return;
  }

  const profileId = parseInt(profileIdRaw, 10);
  if (!profileIdRaw || isNaN(profileId) || profileId < 1) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }

  const cleanDomain = domain.replace(/^www\./i, "").toLowerCase().trim();

  const rules = await db
    .select()
    .from(blockedSitesTable)
    .where(
      and(
        eq(blockedSitesTable.profileId, profileId),
        eq(blockedSitesTable.isEnabled, true),
      ),
    );

  const matchedRule = rules.find((r) => {
    const ruleDomain = r.domain.replace(/^www\./i, "").toLowerCase();
    return (
      cleanDomain === ruleDomain || cleanDomain.endsWith("." + ruleDomain)
    );
  });

  const wasBlocked = !!matchedRule;

  await db.insert(activityLogsTable).values({
    profileId,
    domain: cleanDomain,
    wasBlocked,
    timestamp: new Date(),
  });

  res.json({
    blocked: wasBlocked,
    domain: cleanDomain,
    category: matchedRule?.category ?? null,
  });
});

export default router;
