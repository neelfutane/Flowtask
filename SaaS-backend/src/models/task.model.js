import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    source: {
      type: String,
      enum: ["manual", "pdf"],
      default: "manual"
    },
    sourceFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File"
    }
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
