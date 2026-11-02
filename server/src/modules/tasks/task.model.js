import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date and time is required"],
    },
    priority: {
      type: String,
      enum: {
        values: ["LOW", "MEDIUM", "HIGH", null],
        message: "Priority must be LOW, MEDIUM, HIGH, or null",
      },
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["IN_PROGRESS", "COMPLETED"],
        message: "Status must be IN_PROGRESS or COMPLETED",
      },
      default: "IN_PROGRESS",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes supporting weekly grouping, status counts, and text search
taskSchema.index({ scheduledAt: 1, status: 1 });
taskSchema.index({ title: "text", description: "text" });

export const Task = mongoose.model("Task", taskSchema);
