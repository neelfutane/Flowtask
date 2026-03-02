const Notification = require("../models/notification.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const nodemailer = require("nodemailer");

// Configure email transporter (adjust for your email provider)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Check for tasks with approaching deadlines and send reminders
exports.sendDeadlineReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find tasks due within the next 24 hours
    const upcomingTasks = await Task.find({
      dueDate: { $gte: today, $lte: tomorrow },
      status: { $ne: "done" }
    }).populate("assignedTo", "name email settings");

    for (const task of upcomingTasks) {
      if (!task.assignedTo) continue;

      const user = task.assignedTo;
      
      // Check if user has task reminders enabled
      if (!user.settings?.taskReminders) continue;

      // Create in-app notification
      await Notification.create({
        user: user._id,
        type: "deadline_approaching",
        title: "Task Deadline Approaching",
        message: `"${task.title}" is due soon!`,
        relatedTask: task._id
      });

      // Send email if email notifications are enabled
      if (user.settings?.emailNotifications) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `Reminder: "${task.title}" is due soon`,
          html: `
            <h2>Task Deadline Reminder</h2>
            <p>Hi ${user.name},</p>
            <p>Your task "<strong>${task.title}</strong>" is due on ${new Date(task.dueDate).toLocaleDateString()}.</p>
            <p>Don't forget to complete it on time!</p>
          `
        });
      }
    }

    console.log(`Sent ${upcomingTasks.length} deadline reminders`);
  } catch (error) {
    console.error("Error sending deadline reminders:", error);
  }
};

// Create a notification
exports.createNotification = async (userId, type, title, message, relatedData = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      ...relatedData
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
