const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { USER_ROLES } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CITIZEN,
    },
    language_preference: {
      type: String,
      enum: ["en", "hi"],
      default: "en",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    reports_submitted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Emergency",
      },
    ],
    reputation_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    contact_info: {
      phone: String,
      emergency_contact: {
        name: String,
        phone: String,
        relationship: String,
      },
    },
    notification_preferences: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
    last_login: Date,
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update reputation
userSchema.methods.updateReputation = async function (change) {
  this.reputation_score = Math.max(
    0,
    Math.min(100, this.reputation_score + change)
  );
  await this.save();
};

// Method to add report
userSchema.methods.addReport = async function (emergencyId) {
  if (!this.reports_submitted.includes(emergencyId)) {
    this.reports_submitted.push(emergencyId);
    await this.save();
  }
};

// Virtual for report count
userSchema.virtual("reportCount").get(function () {
  return this.reports_submitted.length;
});

// Virtual for isVerified
userSchema.virtual("isVerified").get(function () {
  return this.verified;
});

// Ensure virtuals are included in JSON
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password; // Don't include password in JSON responses
    return ret;
  },
});

userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
