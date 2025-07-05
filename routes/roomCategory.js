import express from "express";
import {
    createRoomCategory,
    getAllRoomCategories,
  updateRoomCategory,
  deleteRoomCategory,
} from "../controllers/roomCategory.js";

const router = express.Router();

router.post("/", createRoomCategory);        // ➕ Add
router.get("/", getAllRoomCategories);       // 📄 List
router.put("/:id", updateRoomCategory);   // ✏️ Update
router.delete("/:id", deleteRoomCategory); // 🗑️ Delete

export default router;
