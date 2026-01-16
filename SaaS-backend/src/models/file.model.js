import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    originalName: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  },
  { timestamps: true }
);

export const File = mongoose.model("File", fileSchema);
