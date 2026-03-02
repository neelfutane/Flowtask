const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/user.routes");
const taskRoutes = require("./routes/task.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes"); 
const projectRoutes = require("./routes/project.routes");
const teamRoutes = require("./routes/team.routes");
const notificationRoutes = require("./routes/notification.routes");
require("./jobs/deadline-reminder");

const app = express();

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);   //  login / refresh / logout
app.use("/api/v1/users", userRoutes);  // user related
app.use("/api/v1/tasks", taskRoutes);  // protected via middleware
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

module.exports = app;
