// const User = require("../models/user.model");

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     //  Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         message: "All fields are required"
//       });
//     }

//     //  Check existing user
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({
//         message: "User already exists"
//       });
//     }

//     //  Create user
//     const user = await User.create({
//       name,
//       email,
//       password
//     });

//     res.status(201).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });

//   } catch (error) {
//     console.error("Register User Error:", error);

//     res.status(500).json({
//       message: "Registration failed"
//     });
//   }
// };

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Email and password are required"
//       });
//     }

//     //  Find user
//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid credentials"
//       });
//     }

//     // Compare password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({
//         message: "Invalid credentials"
//       });
//     }

//     //  Generate token
//     const token = user.generateJWT();

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });

//   } catch (error) {
//     console.error("Login User Error:", error);

//     res.status(500).json({
//       message: "Login failed"
//     });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser
// };
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar || "",
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, bio },
      { new: true }
    ).select("-password -refreshToken");

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar || "",
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user settings
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      settings: user.settings || {
        emailNotifications: true,
        taskReminders: true,
        projectUpdates: false,
        theme: 'system'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    const { emailNotifications, taskReminders, projectUpdates, theme } = req.body;
    
    const updateData = {};
    if (emailNotifications !== undefined) updateData["settings.emailNotifications"] = emailNotifications;
    if (taskReminders !== undefined) updateData["settings.taskReminders"] = taskReminders;
    if (projectUpdates !== undefined) updateData["settings.projectUpdates"] = projectUpdates;
    if (theme !== undefined) updateData["settings.theme"] = theme;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );

    res.json({ success: true, settings: user.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Store the file path or URL (adjust based on your file storage solution)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    res.json({ success: true, avatarUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
