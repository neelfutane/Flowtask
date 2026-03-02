const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { sendWelcomeEmail } = require("../services/email.service");

/* =========================
   REGISTER
========================= */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // 2. Create user (password auto-hashed via model middleware)
    const user = await User.create({
      name,
      email,
      password,
      settings: {
        emailNotifications: true,
        taskReminders: true,
        projectUpdates: false,
        theme: "system"
      }
    });

    // 3. Send welcome email (non-blocking)
    sendWelcomeEmail({ name: user.name, email: user.email })
      .catch(err => console.error("Welcome email error:", err));

    res.status(201).json({
      success: true,
      message: "Account created successfully! Please log in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
};


/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user with password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 2. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 3. Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 4. Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // 5. Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // 6. Send access token in response
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};


/* =========================
   REFRESH ACCESS TOKEN
========================= */
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided"
      });
    }

    // 1. Find user by refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    // 2. Verify token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 3. Generate new access token
    const newAccessToken = user.generateAccessToken();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });

  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Could not refresh token",
      error: error.message
    });
  }
};


/* =========================
   LOGOUT
========================= */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: null }
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message
    });
  }
};


module.exports = {
  register,
  login,
  refreshAccessToken,
  logout
};