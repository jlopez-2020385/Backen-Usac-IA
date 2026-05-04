import mongoose, { Schema } from "mongoose";

const ProfileAISchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    educationLevel: {
      type: String,
      required: true,
    },

    workStatus: {
      type: String,
    },

    dailyStudyTime: {
      type: Number,
    },

    learningStyle: {
      type: String,
      enum: ["video", "reading", "practice"],
    },

    transportTime: {
      type: Number,
    },

    goals: {
      type: String,
    },

    favoriteSubjects: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("ProfileAI", ProfileAISchema);