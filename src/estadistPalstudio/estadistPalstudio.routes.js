import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-validate.js";
import { getStatistics, generatePlan, getStatisticsAndPlan } from "./estadistPalstudio.controller.js";

const router = Router();

router.get("/statistics", authMiddleware, getStatistics);
router.post("/study-plan", authMiddleware, generatePlan);
router.get("/statistics-and-plan", authMiddleware, getStatisticsAndPlan);

export default router;