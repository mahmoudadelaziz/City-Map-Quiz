import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mapQuizRouter from "./map-quiz";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mapQuizRouter);

export default router;
