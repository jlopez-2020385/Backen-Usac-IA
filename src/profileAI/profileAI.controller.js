import ProfileAI from "./profileAI.model.js";
import User from "../user/user.model.js";

export const createProfileAI = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const data = req.body;

    const existingProfile = await ProfileAI.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await ProfileAI.create({ ...data, user: userId });

    await User.findByIdAndUpdate(userId, { profileAI: profile._id });

    return res.status(201).json({ message: "Profile created", profile });
  } catch (error) {
    return res.status(500).json({ message: "Error creating profile", error: error.message });
  }
};

export const getProfileAI = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const profile = await ProfileAI.findOne({ user: userId });

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Error getting profile", error: error.message });
  }
};

export const updateProfileAI = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const data = req.body;

    const profile = await ProfileAI.findOneAndUpdate(
      { user: userId },
      data,
      { new: true }
    );

    return res.status(200).json({ message: "Profile updated", profile });
  } catch (error) {
    return res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

export const deleteProfileAI = async (req, res) => {
  try {
    const userId = req.usuario._id;
    await ProfileAI.findOneAndDelete({ user: userId });

    return res.status(200).json({ message: "Profile deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting profile", error: error.message });
  }
};

export const analyzeLearningProfile = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const profile = await ProfileAI.findOne({ user: userId });

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json({
      message: "Learning analysis completed",
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: "Error analyzing profile", error: error.message });
  }
};