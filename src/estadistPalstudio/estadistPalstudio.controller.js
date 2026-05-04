import EstadistPalstudio from "./estadistPalstudio.model.js";
import {
  calculateProgress,
  calculateOverallProgress,
  generateStudyPlan
} from "../ai/estadistPalstudioIA.service.js";

export const getStatistics = async (req, res) => {
  try {
    const userId = req.usuario._id;

    const topics = await calculateProgress(userId);
    const general = await calculateOverallProgress(userId);

    const stats = await EstadistPalstudio.findOneAndUpdate(
      { user: userId },
      { progress: { general, topics } },
      { new: true, upsert: true }
    );

    res.json(stats);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generatePlan = async (req, res) => {
  try {
    const userId = req.usuario._id;

    const { studyPlan } = await generateStudyPlan(userId);

    res.json({ studyPlan });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatisticsAndPlan = async (req, res) => {
  try {
    const userId = req.usuario._id;

    const topics = await calculateProgress(userId);
    const general = await calculateOverallProgress(userId);

    const stats = await EstadistPalstudio.findOneAndUpdate(
      { user: userId },
      { progress: { general, topics } },
      { new: true, upsert: true }
    );

    const { studyPlan } = await generateStudyPlan(userId);

    res.json({
      statistics: stats,
      studyPlan
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};