import ChatAI from "./chatAI.model.js";
import ProfileAI from "../profileAI/profileAI.model.js";
import { generateAIResponse } from "../ai/ai.service.js";

/* ================= ENVIAR MENSAJE ================= */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const { message, topic } = req.body;

    let chat = await ChatAI.findOne({ user: userId, topic });

    if (!chat) {
      chat = await ChatAI.create({
        user: userId,
        topic,
        messages: []
      });
    }

    // 🔥 1. guardar mensaje usuario
    chat.messages.push({
      role: "user",
      content: message,
      type: "text"
    });

    // 🔥 2. obtener últimos mensajes (MEMORIA)
    const lastMessages = chat.messages.slice(-10); // puedes subir a 15 si quieres

    // 🔥 3. perfil del usuario
    const profile = await ProfileAI.findOne({ user: userId });

    // 🔥 4. IA con contexto
    const aiResponse = await generateAIResponse(lastMessages, profile);

    // 🔥 5. guardar respuesta IA
    chat.messages.push({
      role: "assistant",
      content: aiResponse,
      type: "text"
    });

    await chat.save();

    return res.status(200).json(chat);

  } catch (error) {
    return res.status(500).json({
      message: "Error sending message",
      error: error.message
    });
  }
};

/* ================= HISTORIAL ================= */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.usuario._id;

    const chats = await ChatAI.find({ user: userId })
      .select("topic messages");

    return res.status(200).json(chats);

  } catch (error) {
    return res.status(500).json({
      message: "Error getting history",
      error: error.message
    });
  }
};

/* ================= ELIMINAR ================= */
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body;

    await ChatAI.findByIdAndDelete(chatId);

    return res.status(200).json({
      message: "Chat deleted"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error deleting chat",
      error: error.message
    });
  }
};