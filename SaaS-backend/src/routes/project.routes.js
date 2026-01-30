// const express = require("express");
// const router = express.Router();
// const { verifyJWT } = require("../middlewares/auth.middleware");
// const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require("../controllers/project.controller");

// router.use(verifyJWT);

// router.post("/", createProject);
// router.get("/", getProjects);
// router.get("/:id", getProjectById);
// router.put("/:id", updateProject);
// router.delete("/:id", deleteProject);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectActivity,
} = require("../controllers/project.controller");

router.get("/", verifyJWT, getProjects);
router.post("/", verifyJWT, createProject);
router.get("/:id", verifyJWT, getProjectById);
router.put("/:id", verifyJWT, updateProject);
router.delete("/:id", verifyJWT, deleteProject);

// Member management
router.post("/:id/members", verifyJWT, addMember);
router.delete("/:id/members/:memberId", verifyJWT, removeMember);

// Activity
router.get("/:id/activity", verifyJWT, getProjectActivity);

module.exports = router;
