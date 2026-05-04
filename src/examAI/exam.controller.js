import ExamAI from "./exam.model.js";
import ChatAI from "../chatAI/chatAI.model.js";

import {
  generateExamAI,
  processPDF,
  processImage,
  processVideo,
  summarizeContent,
  safeParseAI,
  shuffleQuestions
} from "../ai/examAI.service.js";

import fs from "fs";
import path from "path";

/* ================================
   GENERAR EXAMEN
================================ */
export const generateExam = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const { topic, difficulty, sourceType, link } = req.body;

    let content = "";

    /* ---------- INPUT ---------- */
    if (req.file) {
      const filePath = path.resolve(req.file.path);

      if (sourceType === "pdf") {
        content = await processPDF(fs.readFileSync(filePath));
      } else if (sourceType === "image") {
        content = await processImage(filePath);
      } else if (sourceType === "video") {
        content = await processVideo(filePath);
      }

      fs.unlinkSync(filePath);
    } else if (sourceType === "chat") {
      const chats = await ChatAI.find({ user: userId, topic });

      content = chats
        .map(c => c.messages.map(m => `${m.role}: ${m.content}`).join("\n"))
        .join("\n\n");
    } else {
      content = `Tema: ${topic}`;
    }

    /* ---------- IA ---------- */
    const summary = await summarizeContent(content);
    const aiText = await generateExamAI(topic, difficulty, summary);

    const parsed = safeParseAI(aiText);

    if (!parsed) {
      console.error("RAW AI:", aiText);

      return res.status(500).json({
        message: "IA devolvió JSON inválido"
      });
    }

    const questions = shuffleQuestions(parsed.questions);

    const exam = await ExamAI.create({
      user: userId,
      topic,
      difficulty,
      sourceType,
      sourceContent: summary,
      questions,
      totalQuestions: questions.length
    });

    return res.json({ exam });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generando examen" });
  }
};

/* ================================
   SUBMIT
================================ */
export const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    const exam = await ExamAI.findById(examId);

    let score = 0;

    exam.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    exam.score = score;
    exam.userAnswers = answers;

    await exam.save();

    return res.json({
      score,
      total: exam.totalQuestions,
      message: score >= exam.totalQuestions * 0.7
        ? "Excelente 🎉"
        : "Sigue practicando 📚"
    });
  } catch (error) {
    return res.status(500).json({ message: "Error submit" });
  }
};

/* ================================
   REPEAT
================================ */
export const repeatExam = async (req, res) => {
  try {
    const { examId } = req.body;

    const exam = await ExamAI.findById(examId);

    const aiText = await generateExamAI(
      exam.topic,
      exam.difficulty,
      exam.sourceContent
    );

    const parsed = safeParseAI(aiText);

    if (!parsed) {
      return res.status(500).json({ message: "IA error repeat" });
    }

    exam.questions = shuffleQuestions(parsed.questions);
    exam.score = 0;
    exam.userAnswers = [];

    await exam.save();

    return res.json(exam);
  } catch {
    return res.status(500).json({ message: "Error repeat" });
  }
};

/* ================================
   HISTORY
================================ */
export const getExamHistory = async (req, res) => {
  const exams = await ExamAI.find({ user: req.usuario._id });
  res.json(exams);
};