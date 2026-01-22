const express = require("express");
const router = express.Router();

const { verifyJWT } = require("../middlewares/auth.middleware");

const createProject = (req, res) => {
  res.status(201).json({
    message: "Project created successfully",
    userId: req.user.id
  });
};

router.post("/create", verifyJWT, createProject);

module.exports = router;
