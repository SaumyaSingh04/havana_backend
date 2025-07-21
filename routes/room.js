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

router.post("/", upload.array("photos", 10), createRoom);
router.get("/", getAllRooms); // GET ?search=&page=1&limit=10
router.get("/:id", getRoomById);
router.put("/:id", upload.array("photos", 10), updateRoom);
router.delete("/:id", deleteRoom);

export default router;
