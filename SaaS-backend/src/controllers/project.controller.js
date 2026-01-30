// const { Project } = require("../models/project.model");
// const { Task } = require("../models/task.model");

// const createProject = async (req, res) => {
//   try {
//     const project = await Project.create({
//       ...req.body,
//       owner: req.user.id,
//       members: [req.user.id]
//     });
//     res.status(201).json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getProjects = async (req, res) => {
//   try {
//     const projects = await Project.find({
//       $or: [{ owner: req.user.id }, { members: req.user.id }]
//     }).populate("owner members", "name email");
    
//     // Add task counts
//     const projectsWithStats = await Promise.all(
//       projects.map(async (project) => {
//         const tasksCount = await Task.countDocuments({ project: project._id });
//         const completedCount = await Task.countDocuments({ project: project._id, status: "done" });
//         return {
//           ...project.toObject(),
//           tasksCount,
//           progress: tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 0
//         };
//       })
//     );
    
//     res.json({ success: true, projects: projectsWithStats });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getProjectById = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .populate("owner members", "name email");
//     if (!project) {
//       return res.status(404).json({ success: false, message: "Project not found" });
//     }
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const updateProject = async (req, res) => {
//   try {
//     const project = await Project.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const deleteProject = async (req, res) => {
//   try {
//     await Project.findByIdAndDelete(req.params.id);
//     await Task.deleteMany({ project: req.params.id });
//     res.json({ success: true, message: "Project deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
const { Project } = require("../models/project.model");
const { Task } = require("../models/task.model");
const { Activity } = require("../models/activity.model");
const User = require("../models/user.model"); // Adjust based on your user model

// Helper to format user data
const formatUser = (user, role = "Member") => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role,
});

// Get all projects for current user
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { "members.user": userId }
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    // Get task counts and progress for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === "done").length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Format members
        const members = project.members.map(m => formatUser(m.user, m.role));
        
        return {
          _id: project._id,
          name: project.name,
          description: project.description,
          owner: formatUser(project.owner, "Owner"),
          members,
          status: project.status,
          tasksCount: totalTasks,
          progress,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      })
    );

    res.json({ success: true, projects: projectsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if user has access
    const isOwner = project.owner._id.toString() === userId;
    const isMember = project.members.some(m => m.user._id.toString() === userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get task stats
    const tasks = await Task.find({ project: id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const formattedProject = {
      _id: project._id,
      name: project.name,
      description: project.description,
      owner: formatUser(project.owner, "Owner"),
      members: project.members.map(m => formatUser(m.user, m.role)),
      status: project.status,
      tasksCount: totalTasks,
      progress,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    res.json({ success: true, project: formattedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: userId,
      members: [],
    });

    await project.populate("owner", "name email");

    // Log activity
    await Activity.create({
      project: project._id,
      user: userId,
      action: "created project",
      target: project.name,
      targetType: "project",
      targetId: project._id,
    });

    res.status(201).json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        owner: formatUser(project.owner, "Owner"),
        members: [],
        status: project.status,
        tasksCount: 0,
        progress: 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only owner can update
    if (project.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only project owner can update" });
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;

    await project.save();
    await project.populate("owner", "name email");
    await project.populate("members.user", "name email");

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only project owner can delete" });
    }

    // Delete all tasks and activities associated with the project
    await Task.deleteMany({ project: id });
    await Activity.deleteMany({ project: id });
    await Project.findByIdAndDelete(id);

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.members.some(
      m => m.user.toString() === userId && m.role === "Admin"
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }

    // Check if already a member
    if (project.owner.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ success: false, message: "User is the project owner" });
    }

    const existingMember = project.members.find(
      m => m.user.toString() === userToAdd._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }

    project.members.push({
      user: userToAdd._id,
      role: role || "Member",
    });

    await project.save();
    await project.populate("owner", "name email");
    await project.populate("members.user", "name email");

    // Log activity
    await Activity.create({
      project: project._id,
      user: userId,
      action: "added member",
      target: userToAdd.name,
      targetType: "member",
      targetId: userToAdd._id,
    });

    res.json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        owner: formatUser(project.owner, "Owner"),
        members: project.members.map(m => formatUser(m.user, m.role)),
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove member from project
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Only project owner can remove members" });
    }

    const memberIndex = project.members.findIndex(
      m => m.user.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const removedMember = project.members[memberIndex];
    project.members.splice(memberIndex, 1);

    await project.save();
    await project.populate("owner", "name email");
    await project.populate("members.user", "name email");

    // Log activity
    const removedUser = await User.findById(memberId);
    await Activity.create({
      project: project._id,
      user: userId,
      action: "removed member",
      target: removedUser?.name || "Unknown",
      targetType: "member",
      targetId: memberId,
    });

    res.json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        owner: formatUser(project.owner, "Owner"),
        members: project.members.map(m => formatUser(m.user, m.role)),
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get project activity
const getProjectActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await Activity.find({ project: id })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedActivity = activities.map(a => ({
      _id: a._id,
      user: a.user?.name || "Unknown",
      action: a.action,
      target: a.target,
      time: a.createdAt,
      avatar: a.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?",
    }));

    res.json({ success: true, activity: formattedActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectActivity,
};
