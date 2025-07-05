import { RoomCategory } from "../models/roomCategory.js";

// ✅ Create Room Category
export const createRoomCategory = async (req, res) => {
  try {
    const { category, status } = req.body;

    const newCategory = new RoomCategory({ category, status });
    await newCategory.save();

    res.status(201).json({ success: true, roomCategory: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Categories
export const getAllRoomCategories = async (req, res) => {
  try {
    const categories = await RoomCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Category
export const updateRoomCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updateData = {};
      if (req.body.category !== undefined)
        updateData.category = req.body.category.trim();
  
      if (req.body.status !== undefined)
        updateData.status = req.body.status.trim();
  
      const updated = await RoomCategory.findByIdAndUpdate(id, updateData, {
        new: true,
      });
  
      res.json({ success: true, roomCategory: updated });
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };  

// ✅ Delete Category
export const deleteRoomCategory = async (req, res) => {
  try {
    await RoomCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
