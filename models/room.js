import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "RoomCategory", required: true },
    room_number: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    extra_bed: { type: Boolean, default: false },
    is_oos: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    description: { type: String },
    photos: [{ type: String }],
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
