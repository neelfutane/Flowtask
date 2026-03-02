const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notification.controller");

router.get("/", verifyJWT, getNotifications);
router.put("/:id/read", verifyJWT, markAsRead);
router.put("/read-all", verifyJWT, markAllAsRead);

module.exports = router;
