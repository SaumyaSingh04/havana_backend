import express from "express";
import upload from "../middleware/upload.js";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/room.js";

const router = express.Router();

router.post("/", upload.array("photos", 15), createRoom);
router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.put("/:id", upload.array("photos", 15), updateRoom);
router.delete("/:id", deleteRoom);

export default router;
