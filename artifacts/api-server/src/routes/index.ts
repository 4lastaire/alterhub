import { Router, type IRouter } from "express";
import healthRouter from "./health";
import membersRouter from "./members";
import frontersRouter from "./fronters";

const router: IRouter = Router();

router.use(healthRouter);
router.use(membersRouter);
router.use(frontersRouter);

export default router;
