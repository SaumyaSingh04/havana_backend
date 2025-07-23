import { Room } from "../models/room.js";
import { RoomCategory } from "../models/roomCategory.js";
import { Booking } from "../models/booking.js";

// ✅ Create a new room
export const createRoom = async (req, res) => {
  try {
    const {
      title, category, room_number, price, extra_bed, is_reserved,
      status, description
    } = req.body;

    const images = req.files?.map(file => file.path) || [];

    const categoryDoc = await RoomCategory.findById(category);
    if (!categoryDoc) return res.status(400).json({ error: "Invalid room category" });

    const room = new Room({
      title,
      category,
      room_number,
      price,
      extra_bed,
      is_reserved,
      status,
      description,
      images
    });

    await room.save();

    res.status(201).json({ success: true, room });
  } catch (error) {
    console.error("Create Room Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all rooms (with category)
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("category");
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get a room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("category");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update a room
export const updateRoom = async (req, res) => {
  try {
    const updates = req.body;
    const images = req.files?.map(file => file.path);
    if (images?.length) updates.images = images;

    const room = await Room.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    res.json({ success: true, room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get rooms by category (with booking status)
export const getRoomsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const rooms = await Room.find({ category: categoryId }).populate("category");
    const bookings = await Booking.find({ category: categoryId, isActive: true });

    const bookedSet = new Set(bookings.map(b => String(b.roomNumber)));

    const roomsWithStatus = rooms.map(room => ({
      _id: room._id,
      title: room.title,
      room_number: room.room_number,
      price: room.price,
      status: room.status,
      isBooked: bookedSet.has(room.room_number),
      canSelect: room.status === "available" && !bookedSet.has(room.room_number),
      category: room.category
    }));

    res.json({ success: true, rooms: roomsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get available rooms grouped by category
export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: "available" }).populate("category");

    const grouped = {};

    rooms.forEach(room => {
      const catId = room.category?._id?.toString() || "uncategorized";
      const catName = room.category?.category || "Uncategorized";

      if (!grouped[catId]) {
        grouped[catId] = {
          categoryId: catId,
          categoryName: catName,
          rooms: []
        };
      }

      grouped[catId].rooms.push({
        _id: room._id,
        title: room.title,
        room_number: room.room_number,
        price: room.price,
        description: room.description
      });
    });

    res.json({
      success: true,
      availableRooms: Object.values(grouped),
      totalCount: rooms.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
