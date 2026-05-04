import axios from "axios";
import Tesseract from "tesseract.js";
import { createRequire } from "module";
import { transcribeAudio } from "../utils/audioTranscription.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.1-8b-instant";

/* ================================
   RESUMIR CONTENIDO
================================ */
export const summarizeContent = async (content) => {
  const limitedContent = content.slice(0, 4000);

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Eres un analizador educativo. Extrae solo información clave."
        },
        {
          role: "user",
          content: `
Extrae:
- conceptos
- fórmulas
- definiciones
- ejemplos

Contenido:
${limitedContent}
          `
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
};

/* ================================
   GENERAR EXAMEN IA
================================ */
export const generateExamAI = async (topic, difficulty, summary) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `
Eres un generador de exámenes.

REGLAS:
- SOLO JSON válido
- SIN markdown
- SIN texto extra
- 10 preguntas exactas
          `
        },
        {
          role: "user",
          content: `
Tema: ${topic}
Dificultad: ${difficulty}

Contenido:
${summary}

Devuelve SOLO JSON:

{
 "questions":[
   {
     "question":"",
     "options":{
       "a":"",
       "b":"",
       "c":"",
       "d":""
     },
     "correctAnswer":"a"
   }
 ]
}
          `
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
};

/* ================================
   SAFE PARSER (ANTI CRASH)
================================ */
export const safeParseAI = (text) => {
  try {
    if (!text) return null;

    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    const json = cleaned.slice(start, end + 1);

    const parsed = JSON.parse(json);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return null;
    }

    return parsed;
  } catch (err) {
    console.error("PARSE ERROR:", err.message);
    return null;
  }
};

/* ================================
   PDF
================================ */
export const processPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

/* ================================
   IMAGEN
================================ */
export const processImage = async (path) => {
  const { data } = await Tesseract.recognize(path, "eng");
  return data.text;
};

/* ================================
   VIDEO
================================ */
export const processVideo = async (path) => {
  return await transcribeAudio(path);
};

/* ================================
   SHUFFLE
================================ */
export const shuffleQuestions = (questions) => {
  return questions.map((q) => {
    const entries = Object.entries(q.options);
    const shuffled = entries.sort(() => Math.random() - 0.5);

    const letters = ["a", "b", "c", "d"];
    const newOptions = {};

    let correctLetter = "";

    shuffled.forEach((opt, i) => {
      const letter = letters[i];
      newOptions[letter] = opt[1];

      if (opt[0] === q.correctAnswer) {
        correctLetter = letter;
      }
    });

    return {
      ...q,
      options: newOptions,
      correctAnswer: correctLetter
    };
  });
};