import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-validate.js";
import {
	createProfileAI,
	getProfileAI,
	updateProfileAI,
	deleteProfileAI,
	analyzeLearningProfile,
} from "./profileAI.controller.js";

const router = Router();

router.post("/create", authMiddleware, createProfileAI);

router.get("/get", authMiddleware, getProfileAI);

router.put("/update", authMiddleware, updateProfileAI);

router.delete("/delete", authMiddleware, deleteProfileAI);

router.post("/analyze", authMiddleware, analyzeLearningProfile);

export default router;

