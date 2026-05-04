import axios from "axios";
import ExamAI from "../examAI/exam.model.js";
import ChatAI from "../chatAI/chatAI.model.js";
import ProfileAI from "../profileAI/profileAI.model.js";
import { jsonrepair } from "jsonrepair";

/* =================================
   LIMPIAR JSON
================================= */
const cleanAIJSON = (text) => {
  try {
    if (!text) return null;

    text = text.replace(/```json/g, "").replace(/```/g, "");

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    return text.slice(start, end + 1);
  } catch {
    return null;
  }
};

/* =================================
   EXTRAER MENSAJES REALES
================================= */
const extractRealTopics = (history) => {
  const texts = [];

  history.chats.forEach((chat) => {
    chat.messages.forEach((m) => {
      if (m.role === "user") {
        texts.push(m.content);
      }
    });
  });

  return texts.slice(-15).join("\n");
};

/* =================================
   VIDEOS
================================= */
const getYouTubeVideos = (query) => {
  return [
    {
      type: "video",
      title: `Video guía: ${query}`,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query + " tutorial curso explicado"
      )}`,
    },
    {
      type: "video",
      title: `Ejercicios resueltos de ${query}`,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query + " ejercicios resueltos"
      )}`,
    },
  ];
};

/* =================================
   PDF
================================= */
const getPDF = (query) => ({
  type: "pdf",
  title: `PDF para estudiar ${query}`,
  link: `https://www.google.com/search?q=${encodeURIComponent(
    query + " filetype:pdf"
  )}`,
});

/* =================================
   RESUMEN IA
================================= */
const summarizeHistory = async (history) => {
  const realText = extractRealTopics(history);

  const prompt = `
Analiza las preguntas reales de un estudiante:

${realText}

Detecta:

1. Materias principales
2. Temas específicos
3. Qué necesita reforzar
4. Nivel estimado
5. Qué debe estudiar primero

Respuesta clara y breve:
`;

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Eres experto en educación." },
        { role: "user", content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices?.[0]?.message?.content || "Sin resumen";
};

/* =================================
   GENERAR PLAN IA (MEJORADO)
================================= */
const generatePlanAI = async (summary, profile) => {
  const prompt = `
Eres un tutor profesional.

Analiza:

${summary}

Perfil:
${JSON.stringify(profile)}

Crea un plan MUY CLARO para el estudiante.

REGLAS IMPORTANTES:

- Agrupa por materias reales:
  Ejemplo:
  HTML
  CSS
  JavaScript
  React
  Node.js
  Matemática
  Historia
  Medicina

- Dentro de cada grupo agrega temas reales.

- En "tips" escribe EXACTAMENTE:
Qué debe estudiar.
Qué debe practicar.
Qué debe buscar en videos.
Qué errores evitar.

- Consejos fáciles de entender.

DEVUELVE SOLO JSON:

{
 "subjects":[
   {
     "name":"React",
     "studyPlan":[
       {
         "topic":"useState y useEffect",
         "time":2,
         "tips":"Estudia cómo funcionan los hooks. Practica estados y renders. Busca videos de componentes dinámicos y manejo de eventos."
       }
     ]
   }
 ]
}
`;

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Devuelve SOLO JSON válido." },
        { role: "user", content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = res.data.choices?.[0]?.message?.content;

  const jsonClean = cleanAIJSON(text);

  let parsed;

  try {
    parsed = JSON.parse(jsonClean);
  } catch {
    parsed = JSON.parse(jsonrepair(jsonClean));
  }

  return parsed.subjects || [];
};

/* =================================
   ENRIQUECER RECURSOS
================================= */
const enrichPlan = async (subjects) => {
  for (const subject of subjects) {
    for (const item of subject.studyPlan) {
      const query = `${subject.name} ${item.topic}`;

      item.resources = [
        ...getYouTubeVideos(query),
        getPDF(query),
      ];
    }
  }

  return subjects;
};

/* =================================
   PROGRESO POR TEMA
================================= */
export const calculateProgress = async (userId) => {
  const exams = await ExamAI.find({ user: userId });

  const topics = {};

  exams.forEach((e) => {
    const topic = e.topic?.toLowerCase() || "general";

    if (!topics[topic]) {
      topics[topic] = {
        correct: 0,
        total: 0,
      };
    }

    topics[topic].correct += e.score;
    topics[topic].total += e.totalQuestions;
  });

  return Object.keys(topics).map((t) => ({
    topic: t,
    progress:
      topics[t].total > 0
        ? Math.round((topics[t].correct / topics[t].total) * 100)
        : 0,
  }));
};

/* =================================
   PROGRESO GENERAL
================================= */
export const calculateOverallProgress = async (userId) => {
  const exams = await ExamAI.find({ user: userId });
  const chats = await ChatAI.find({ user: userId });

  let totalCorrect = 0;
  let totalQuestions = 0;

  exams.forEach((e) => {
    totalCorrect += e.score;
    totalQuestions += e.totalQuestions;
  });

  const examProgress =
    totalQuestions > 0
      ? (totalCorrect / totalQuestions) * 100
      : 0;

  let userMessages = 0;

  chats.forEach((chat) => {
    chat.messages.forEach((m) => {
      if (m.role === "user") userMessages++;
    });
  });

  const chatProgress = Math.min(userMessages * 2, 100);

  return Math.round((examProgress * 0.5) + (chatProgress * 0.5));
};

/* =================================
   PLAN FINAL
================================= */
export const generateStudyPlan = async (userId) => {
  const exams = await ExamAI.find({ user: userId });
  const chats = await ChatAI.find({ user: userId });
  const profile = await ProfileAI.findOne({ user: userId });

  if (!exams.length && !chats.length) {
    return {
      message: "Sin historial",
      studyPlan: [],
    };
  }

  const history = { exams, chats };

  const summary = await summarizeHistory(history);

  const subjects = await generatePlanAI(summary, profile);

  const finalPlan = await enrichPlan(subjects);

  return {
    message: "Plan generado correctamente",
    studyPlan: finalPlan,
  };
};