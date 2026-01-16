import cloudinary from "../utils/cloudinary.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { extractTasksFromText } from "../utils/taskExtractor.js";
import { Task } from "../models/task.model.js";
import { File } from "../models/file.model.js";
import fs from "fs";

export const importTasksFromPDF = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "Only PDF files can be imported as tasks"
      });
    }

    // Upload PDF to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "attachments"
    });

    // Save file metadata
    const fileDoc = await File.create({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      originalName: req.file.originalname,
      uploadedBy: req.user.id,
      project: projectId
    });

    // Extract text from PDF
    const text = await extractTextFromPDF(req.file.path);

    // Extract tasks from text
    const tasks = extractTasksFromText(text);

    if (!tasks.length) {
      return res.status(400).json({ message: "No tasks found in PDF" });
    }

    // Save tasks
    const createdTasks = await Task.insertMany(
      tasks.map(title => ({
        title,
        project: projectId,
        createdBy: req.user.id,
        source: "pdf",
        sourceFile: fileDoc._id
      }))
    );

    res.status(201).json({
      message: "Tasks imported successfully",
      count: createdTasks.length,
      tasks: createdTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    // Always clean up temp file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};
