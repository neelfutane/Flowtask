const express = require("express");
const upload = require("../middlewares/upload.middleware"); // multer instance
const { importTasksFromPDF } = require("../controllers/taskImport.controller");

const router = express.Router();

router.post(
  "/import/pdf",
  upload.single("file"), //  Works now
  importTasksFromPDF
);

module.exports = router;
