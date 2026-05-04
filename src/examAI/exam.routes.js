import { Router } from "express";
import { authMiddleware } from "../middlewares/auth-validate.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

import {

generateExam,
submitExam,
repeatExam,
getExamHistory

} from "./exam.controller.js";

const router = Router();

router.post("/generate", authMiddleware, upload.single("file"), generateExam);

router.post("/submit",authMiddleware,submitExam);

router.post("/repeat",authMiddleware,repeatExam);

router.get("/history",authMiddleware,getExamHistory);

export default router;