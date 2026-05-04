import mongoose, { Schema } from "mongoose";

const QuestionSchema = new Schema({

  question: String,

  options:{
    a:String,
    b:String,
    c:String,
    d:String
  },

  correctAnswer:{
    type:String,
    enum:["a","b","c","d"]
  }

});

const ExamAISchema = new Schema({

  user:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },

  topic:String,

  difficulty:{
    type:String,
    enum:["easy","medium","hard"]
  },

  sourceType:{
    type:String,
    enum:["chat","pdf","image"]
  },

  sourceContent:String,

  questions:[QuestionSchema],

  userAnswers:[String],

  score:{
    type:Number,
    default:0
  },

  totalQuestions:Number,

  resultMessage:String

},{
  timestamps:true,
  versionKey:false
});

export default mongoose.model("ExamAI",ExamAISchema);