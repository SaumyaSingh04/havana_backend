import { Room } from "../models/room.js";

// ✅ CREATE Room
export const createRoom = async (req, res) => {
  try {
    const {
      title,
      category,
      room_number,
      price,
      extra_bed,
      is_oos,
      status,
      description,
    } = req.body;

    const photos = req.files?.map(file => file.path) || [];

    const newRoom = new Room({
      title,
      category,
      room_number,
      price,
      extra_bed,
      is_oos,
      status,
      description,
      photos,
    });

    await newRoom.save();
    res.status(201).json({ success: true, room: newRoom });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET ALL Rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("category").sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET Room By ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("category");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE Room
export const updateRoom = async (req, res) => {
  try {
    const updates = req.body;
    if (req.files?.length > 0) {
      updates.photos = req.files.map(file => file.path);
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE Room
export const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
