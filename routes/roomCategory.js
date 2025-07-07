import express from "express";
import {
  createRoomCategory,
  getAllRoomCategories, 
  updateRoomCategory,
  deleteRoomCategory,
} from "../controllers/roomCategory.js";

const router = express.Router();

router.post("/", createRoomCategory);
router.get("/", getAllRoomCategories); // GET ?search=&page=1&limit=10
router.put("/:id", updateRoomCategory);
router.delete("/:id", deleteRoomCategory);

export default router;
