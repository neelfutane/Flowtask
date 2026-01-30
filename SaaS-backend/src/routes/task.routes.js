const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { importTasksFromPDF } = require("../controllers/task.controller");
const {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const { getMyTasks } = require("../controllers/task.controller");

// CRUD routes
router.get("/project/:projectId", verifyJWT, getTasksByProject);
router.post("/", verifyJWT, createTask);
router.put("/:id", verifyJWT, updateTask);
router.delete("/:id", verifyJWT, deleteTask);
router.get("/my-tasks", getMyTasks);

module.exports = router;
