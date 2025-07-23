import { RoomCategory } from "../models/roomCategory.js";

// ✅ Create Room Category
export const createRoomCategory = async (req, res) => {
  try {
    const { category, status = "Active" } = req.body;

    if (!category?.trim()) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const existing = await RoomCategory.findOne({ category: category.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const newCategory = new RoomCategory({ category: category.trim(), status: status.trim() });
    await newCategory.save();

    res.status(201).json({ success: true, roomCategory: newCategory });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating category" });
  }
};

// ✅ Get All Categories with Search and Pagination
export const getAllRoomCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = search?.trim()
      ? { category: { $regex: search.trim(), $options: "i" } }
      : {};

    const total = await RoomCategory.countDocuments(query);
    const categories = await RoomCategory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      categories,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Room Categories Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching categories" });
  }
};

// ✅ Update Category
export const updateRoomCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, status } = req.body;

    const updateData = {};
    if (category !== undefined) updateData.category = category.trim();
    if (status !== undefined) updateData.status = status.trim();

    const updated = await RoomCategory.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, roomCategory: updated });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ success: false, message: "Server error while updating category" });
  }
};

// ✅ Delete Category
export const deleteRoomCategory = async (req, res) => {
  try {
    const deleted = await RoomCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting category" });
  }
};
