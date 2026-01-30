// const { Task } = require("../models/task.model");
// const { Project } = require("../models/project.model");

// const getDashboardStats = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [totalProjects, tasksAssigned, completedTasks] = await Promise.all([
//       Project.countDocuments({ $or: [{ owner: userId }, { members: userId }] }),
//       Task.countDocuments({ assignedTo: userId }),
//       Task.countDocuments({ assignedTo: userId, status: "done" })
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalProjects,
//         tasksAssigned,
//         completedTasks,
//         hoursTracked: 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 👇 ADD THIS
// const getRecentActivity = async (req, res) => {
//   try {
//     const recentTasks = await Task.find()
//       .populate("createdBy", "name")
//       .sort({ updatedAt: -1 })
//       .limit(10);

//     const activity = recentTasks.map(task => ({
//       user: task.createdBy?.name || "Unknown",
//       action: "created task",
//       target: task.title,
//       time: task.createdAt
//     }));

//     res.json({ success: true, activity });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 
// module.exports = {getDashboardStats,getRecentActivity
// };
const { Task } = require("../models/task.model");
const { Project } = require("../models/project.model");
const { Activity } = require("../models/activity.model");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalProjects, tasksAssigned, completedTasks] = await Promise.all([
      Project.countDocuments({
        $or: [{ owner: userId }, { "members.user": userId }],
      }),
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: "done" }),
    ]);

    res.json({
      success: true,
      stats: {
        totalProjects,
        tasksAssigned,
        completedTasks,
        hoursTracked: 0, // Implement time tracking later
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get projects user is part of
    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    }).select("_id");

    const projectIds = projects.map((p) => p._id);

    const activities = await Activity.find({ project: { $in: projectIds } })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedActivity = activities.map((a) => ({
      _id: a._id,
      user: a.user?.name || "Unknown",
      action: a.action,
      target: a.target,
      time: a.createdAt,
      avatar: a.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?",
    }));

    res.json({ success: true, activity: formattedActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getRecentActivity };
