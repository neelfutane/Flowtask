// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// const userRoutes = require("./routes/user.routes");
// const taskRoutes = require("./routes/task.routes");

// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/tasks", taskRoutes);

// app.get("/", (req, res) => {
//   res.send("Backend is running");
// });

// module.exports = app;
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/user.routes");
const taskRoutes = require("./routes/task.routes");
const authRoutes = require("./routes/auth.routes"); 

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


app.get("/", (req, res) => {
  res.send("Backend is running");
});

module.exports = app;
