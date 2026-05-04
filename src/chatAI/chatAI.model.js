import mongoose, { Schema } from "mongoose";

const ChatAISchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
        },

        content: {
          type: String,
        },

        type: {
          type: String,
          enum: ["text", "video", "pdf", "exercise", "exam"],
        },
      },
    ],

    topic: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("ChatAI", ChatAISchema);