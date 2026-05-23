import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, blockedSitesTable } from "@workspace/db";
import {
  ListBlockedSitesParams,
  CreateBlockedSiteParams,
  CreateBlockedSiteBody,
  UpdateBlockedSiteParams,
  UpdateBlockedSiteBody,
  DeleteBlockedSiteParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profiles/:profileId/blocked-sites", async (req, res): Promise<void> => {
  const params = ListBlockedSitesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const sites = await db
    .select()
    .from(blockedSitesTable)
    .where(eq(blockedSitesTable.profileId, params.data.profileId))
    .orderBy(blockedSitesTable.createdAt);
  res.json(sites);
});

router.post("/profiles/:profileId/blocked-sites", async (req, res): Promise<void> => {
  const params = CreateBlockedSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateBlockedSiteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [site] = await db
    .insert(blockedSitesTable)
    .values({ ...parsed.data, profileId: params.data.profileId })
    .returning();
  res.status(201).json(site);
});

router.patch("/blocked-sites/:id", async (req, res): Promise<void> => {
  const params = UpdateBlockedSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBlockedSiteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [site] = await db
    .update(blockedSitesTable)
    .set(parsed.data)
    .where(eq(blockedSitesTable.id, params.data.id))
    .returning();
  if (!site) {
    res.status(404).json({ error: "Blocked site not found" });
    return;
  }
  res.json(site);
});

router.delete("/blocked-sites/:id", async (req, res): Promise<void> => {
  const params = DeleteBlockedSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [site] = await db
    .delete(blockedSitesTable)
    .where(eq(blockedSitesTable.id, params.data.id))
    .returning();
  if (!site) {
    res.status(404).json({ error: "Blocked site not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
