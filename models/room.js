import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomCategory",
      required: true,
    },
    room_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    extra_bed: {
      type: Boolean,
      default: false,
    },
    is_reserved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "booked", "maintenance"],
      default: "available",
    },
    bookedTillDate: { type: Date, default: null },
    description: {
      type: String,
      trim: true,
    },
    reservedDates: [
      {
        type: Date,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
