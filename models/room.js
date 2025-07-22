import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roomCategory', 
    required: true
  },
  room_number: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  extra_bed: {
    type: Boolean,
    default: false
  },
  is_reserved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'booked', 'maintenance'], // ✅ Added "reserved"
    default: 'available'
  },
  description: {
    type: String
  },
  images: [{
    type: String
  }]
}, { timestamps: true });

export const Room = mongoose.model("Room", roomSchema);
