// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true
//     },

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true
//     },

//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 6,
//       select: false
//     },

//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user"
//     },

//     /*  NEW */
//     refreshToken: {
//       type: String
//     }
//   },
//   { timestamps: true }
// );

// /* Hash password */
// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// /*  Access Token */
// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       id: this._id,
//       email: this.email,
//       role: this.role
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//     }
//   );
// };

// /* Refresh Token */
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       id: this._id
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//     }
//   );
// };

// /* Compare password */
// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };
// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    /* Basic Info */
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    /* Profile Fields */
    bio: {
      type: String,
      default: "",
      maxlength: 500
    },

    avatar: {
      type: String,
      default: ""
    },

    /* User Settings */
    settings: {
      emailNotifications: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: false },
      theme: { 
        type: String, 
        enum: ["light", "dark", "system"], 
        default: "system" 
      }
    },

    /* Auth */
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

/* Hash password before saving */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* Generate Access Token */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

/* Generate Refresh Token */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

/* Compare Password */
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);