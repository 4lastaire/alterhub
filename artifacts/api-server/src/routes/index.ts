import { Router, type IRouter } from "express";
import healthRouter from "./health";
import membersRouter from "./members";
import frontersRouter from "./fronters";
import groupsRouter from "./groups";

const router: IRouter = Router();

router.use(healthRouter);
router.use(membersRouter);
router.use(frontersRouter);
router.use(groupsRouter);

export default router;
