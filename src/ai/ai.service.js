import axios from "axios";

export const generateAIResponse = async (messages, profile) => {
  try {

    // 🔥 LIMPIAR MENSAJES (IMPORTANTE)
    const cleanMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",

        messages: [
          {
            role: "system",
            content: `Eres un tutor educativo.

Perfil del estudiante:
${JSON.stringify(profile)}

INSTRUCCIONES:
- Continúa la conversación
- Mantén contexto
- No reinicies`
          },
          ...cleanMessages
        ],

        max_tokens: 1000
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    throw error;
  }
};