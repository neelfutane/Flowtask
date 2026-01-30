// const express = require("express");
// const router = express.Router();
// const { verifyJWT } = require("../middlewares/auth.middleware");
// const { getDashboardStats, getRecentActivity } = require("../controllers/dashboard.controller");

// router.get("/stats", verifyJWT, getDashboardStats);
// router.get("/activity", verifyJWT, getRecentActivity);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const { getDashboardStats, getRecentActivity } = require("../controllers/dashboard.controller");

router.get("/stats", verifyJWT, getDashboardStats);
router.get("/activity", verifyJWT, getRecentActivity);

module.exports = router;
