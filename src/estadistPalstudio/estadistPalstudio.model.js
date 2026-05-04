import mongoose, { Schema } from "mongoose";

const EstadistPalstudioSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  progress: {
    general: Number, // Porcentaje general
    topics: [
      {
        topic: String,
        progress: Number, // Porcentaje por tema
      },
    ],
  },
  studyPlan: [
    {
      topic: String,
      resources: [
        {
          type: String, // "book" o "video"
          title: String,
          link: String,
        },
      ],
      time: Number, // Tiempo recomendado en minutos
    },
  ],
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("EstadistPalstudio", EstadistPalstudioSchema);