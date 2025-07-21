import {RoomCategory}  from "../models/roomCategory.js";

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

// ✅ Get All Categories with Search and Pagination
export const getAllRoomCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      query.category = regex;
    }

    const categories = await RoomCategory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await RoomCategory.countDocuments(query);

    res.json({
      success: true,
      categories,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Room Categories error:", error);
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
