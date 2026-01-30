// const mongoose = require("mongoose");

// const taskSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true
//     },
//     project: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     },
//     source: {
//       type: String,
//       enum: ["manual", "pdf"],
//       default: "manual"
//     },
//     sourceFile: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "File"
//     },
//     status: {
//   type: String,
//   enum: ["todo", "in-progress", "done"],
//   default: "todo"
// },
// assignedTo: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "User"
// }
//   },
//   { timestamps: true }
// );

// const Task = mongoose.model("Task", taskSchema);

// module.exports = { Task };
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    source: {
      type: String,
      enum: ["manual", "pdf"],
      default: "manual",
    },
    sourceFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };
