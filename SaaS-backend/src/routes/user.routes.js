const express = require("express");
const { registerUser, loginUser } = require("../controllers/user.controller");

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router; //  Export the router directly
