const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  getSettings,
  updateSettings,
  uploadAvatar
} = require("../controllers/user.controller");

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

router.get("/profile", verifyJWT, getProfile);
router.put("/profile", verifyJWT, updateProfile);
router.put("/change-password", verifyJWT, changePassword);
router.get("/settings", verifyJWT, getSettings);
router.put("/settings", verifyJWT, updateSettings);
router.post("/avatar", verifyJWT, upload.single("avatar"), uploadAvatar);

module.exports = router;
