const { Task } = require("../models/task.model");
const { Project } = require("../models/project.model");
const { Activity } = require("../models/activity.model");

// ===============================
// Get tasks by project
// ===============================
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const formattedTasks = tasks.map(task => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo
        ? {
            _id: task.assignedTo._id,
            name: task.assignedTo.name,
            email: task.assignedTo.email,
          }
        : null,
      createdBy: task.createdBy
        ? {
            _id: task.createdBy._id,
            name: task.createdBy.name,
            email: task.createdBy.email,
          }
        : null,
      project: task.project,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    res.json({ success: true, tasks: formattedTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Create task
// ===============================
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, project } =
      req.body;
    const userId = req.user.id;

    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Task title is required" });
    }

    if (!project) {
      return res
        .status(400)
        .json({ success: false, message: "Project ID is required" });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      project,
      createdBy: userId,
      source: "manual",
    });

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    await Activity.create({
      project,
      user: userId,
      action: "created task",
      target: task.title,
      targetType: "task",
      targetId: task._id,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Update task
// ===============================
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;
    const userId = req.user.id;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const oldStatus = task.status;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;

    await task.save();
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    if (status && status !== oldStatus) {
      const statusLabels = {
        todo: "To Do",
        "in-progress": "In Progress",
        done: "Done",
      };

      await Activity.create({
        project: task.project,
        user: userId,
        action: `moved task to ${statusLabels[status]}`,
        target: task.title,
        targetType: "task",
        targetId: task._id,
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Delete task
// ===============================
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    await Activity.create({
      project: task.project,
      user: userId,
      action: "deleted task",
      target: task.title,
      targetType: "task",
      targetId: task._id,
    });

    await Task.findByIdAndDelete(id);

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Get tasks assigned to current user
// ===============================
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// EXPORTS (single style ✅)
// ===============================
module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
};
