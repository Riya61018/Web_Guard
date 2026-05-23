import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import blockedSitesRouter from "./blocked-sites";
import activityRouter from "./activity";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(blockedSitesRouter);
router.use(activityRouter);
router.use(dashboardRouter);

export default router;
