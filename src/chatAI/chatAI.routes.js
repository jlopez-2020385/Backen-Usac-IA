import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-validate.js";
import {
	sendMessage,
	getChatHistory,
	deleteChat,

} from "./chatAI.controller.js";

const router = Router();

router.post("/send", authMiddleware, sendMessage);

router.get("/history", authMiddleware, getChatHistory);

router.delete("/delete", authMiddleware, deleteChat);


export default router;

