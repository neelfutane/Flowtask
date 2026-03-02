const cron = require("node-cron");
const { sendDeadlineReminders } = require("../services/notification.service");

// Run every day at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("Running deadline reminder job...");
  sendDeadlineReminders();
});

module.exports = cron;
