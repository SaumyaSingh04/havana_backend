import mongoose from "mongoose";

const roomCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export const RoomCategory = mongoose.model("RoomCategory", roomCategorySchema);
