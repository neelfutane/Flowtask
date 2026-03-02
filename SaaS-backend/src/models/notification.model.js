const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["task_reminder", "project_update", "task_assigned", "deadline_approaching"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  read: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
