import express from "express";
import upload from "../middleware/upload.js";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByCategory,
  getAvailableRooms
} from "../controllers/room.js";

const router = express.Router();

router.post("/", upload.array("photos", 4), createRoom);
router.get("/", getRooms);
router.get("/available", getAvailableRooms);
router.get("/category/:categoryId", getRoomsByCategory);
router.get("/:id", getRoomById);
router.put("/:id", upload.array("photos", 4), updateRoom);
router.delete("/:id", deleteRoom);

export default router;
