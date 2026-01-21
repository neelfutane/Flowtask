const express = require("express");
const upload = require("../middlewares/upload.middleware");
const { importTasksFromPDF } = require("../controllers/taskImport.controller");
const { verifyJWT } = require("../middlewares/auth.middleware"); // 🔐 NEW

const router = express.Router();

router.post(
  "/import/pdf",
  verifyJWT,              //  1. Check access token
  upload.single("file"),  // 2. Handle file upload
  importTasksFromPDF      // 3. Controller
);

module.exports = router;
