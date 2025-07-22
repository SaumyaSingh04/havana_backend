import { Room } from "../models/room.js";

// // ✅ CREATE Room
// export const createRoom = async (req, res) => {
//   try {
//     const {
//       title,
//       category,
//       room_number,
//       price,
//       extra_bed,
//       is_oos,
//       status,
//       description,
//     } = req.body;

//     const photos = req.files?.map(file => file.path) || [];

//     const newRoom = new Room({
//       title,
//       category,
//       room_number,
//       price,
//       extra_bed,
//       is_oos,
//       status,
//       description,
//       photos,
//     });

//     await newRoom.save();
//     res.status(201).json({ success: true, room: newRoom });
//   } catch (error) {
//     console.error("Create room error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// ✅ GET ALL Rooms — with search, filters, pagination
export const getAllRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      status,
      is_oos,
      extra_bed,
    } = req.query;

    const query = {};

    // 🔍 Search by title or room_number
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { room_number: regex },
      ];
    }

    // ✅ Filters
    if (category) query.category = category;
    if (status !== undefined) query.status = status === "true";
    if (is_oos !== undefined) query.is_oos = is_oos === "true";
    if (extra_bed !== undefined) query.extra_bed = extra_bed === "true";

    const rooms = await Room.find(query)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      rooms,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// // ✅ GET Room By ID
// export const getRoomById = async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.id).populate("category");
//     if (!room) return res.status(404).json({ success: false, message: "Room not found" });
//     res.json({ success: true, room });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ UPDATE Room
// export const updateRoom = async (req, res) => {
//   try {
//     const updates = req.body;
//     if (req.files?.length > 0) {
//       updates.photos = req.files.map(file => file.path);
//     }

//     const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
//     res.json({ success: true, room: updatedRoom });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ DELETE Room
// export const deleteRoom = async (req, res) => {
//   try {
//     await Room.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "Room deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const {
      title,
      category,
      room_number,
      price,
      extra_bed,
      is_reserved,
      status,
      description,
      images,
    } = req.body;
    const room = new Room({
      title,
      category,
      room_number, // Ensure room_number is included
      price,
      extra_bed,
      is_reserved,
      status,
      description,
      images,
    });
    await room.save();

    // Count rooms per category and get all room numbers for the created room's category
    const categories = await Room.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          roomNumbers: { $push: "$room_number" },
        },
      },
    ]);

    // Populate category names

    const populated = await Promise.all(
      categories.map(async (cat) => {
        const categoryDoc = await Category.findById(cat._id);
        return {
          category: categoryDoc?.name || "Unknown",
          count: cat.count,
          roomNumbers: cat.roomNumbers,
        };
      })
    );

    res.status(201).json({
      room,
      summary: populated,
      allocatedRoomNumber: room.room_number,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("category");
    
    // Map rooms to ensure safe access to category properties
    const safeRooms = rooms.map(room => {
      const roomObj = room.toObject();
      if (!roomObj.category) {
        roomObj.category = { name: 'Unknown' };
      }
      return roomObj;
    });
    
    res.json(safeRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("category");
    if (!room) return res.status(404).json({ error: "Room not found" });
    
    // Ensure safe access to category properties
    const safeRoom = room.toObject();
    if (!safeRoom.category) {
      safeRoom.category = { name: 'Unknown' };
    }
    
    res.json(safeRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a room
export const updateRoom = async (req, res) => {
  try {
    const updates = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get rooms by category with booking status
export const getRoomsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const rooms = await Room.find({ category: categoryId }).populate("category");
    const activeBookings = await Booking.find({
      category: categoryId,
      isActive: true,
    });
    const bookedRoomNumbers = new Set(
      activeBookings.map((booking) => booking.roomNumber)
    );

    const roomsWithStatus = rooms.map((room) => {
      // Ensure safe access to category properties
      const category = room.category || { name: 'Unknown' };
      
      return {
        _id: room._id,
        title: room.title,
        room_number: room.room_number,
        price: room.price,
        status: room.status,
        category: category,
        isBooked: bookedRoomNumbers.has(parseInt(room.room_number)),
        canSelect:
          !bookedRoomNumbers.has(parseInt(room.room_number)) &&
          room.status === "available",
      };
    });

    res.json({ success: true, rooms: roomsWithStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all available rooms
export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'available' }).populate('category');
    
    // Group by category for easier frontend display
    const groupedByCategory = {};
    
    // Add uncategorized group for rooms without a category
    const uncategorizedId = 'uncategorized';
    groupedByCategory[uncategorizedId] = {
      categoryId: uncategorizedId,
      categoryName: 'Uncategorized',
      rooms: []
    };
    
    rooms.forEach(room => {
      if (!room.category) {
        // Add to uncategorized group
        groupedByCategory[uncategorizedId].rooms.push({
          _id: room._id,
          title: room.title,
          room_number: room.room_number,
          price: room.price,
          description: room.description
        });
        return;
      }
      
      const categoryId = room.category._id.toString();
      const categoryName = room.category.name;
      
      if (!groupedByCategory[categoryId]) {
        groupedByCategory[categoryId] = {
          categoryId,
          categoryName,
          rooms: []
        };
      }
      
      groupedByCategory[categoryId].rooms.push({
        _id: room._id,
        title: room.title,
        room_number: room.room_number,
        price: room.price,
        description: room.description
      });
    });
    
    // Remove empty categories
    const filteredCategories = Object.values(groupedByCategory).filter(category => category.rooms.length > 0);
    
    res.json({
      success: true,
      availableRooms: filteredCategories,
      totalCount: rooms.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
