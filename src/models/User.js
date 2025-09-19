const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password_hash: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password_hash;
        return ret;
      },
    },
  }
);

// Indexes are automatically created by unique: true in schema

// Static methods
userSchema.statics.create = async function (userData) {
  const { username, email, password } = userData;

  // Hash password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  const user = new this({
    username,
    email,
    password_hash,
  });

  return await user.save();
};

userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email });
};

userSchema.statics.findByUsername = async function (username) {
  return await this.findOne({ username });
};

userSchema.statics.findById = async function (id) {
  return await this.findOne({ _id: id });
};

// Instance methods
userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  userObject.id = userObject._id;
  delete userObject._id;
  delete userObject.__v;
  delete userObject.password_hash;
  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
