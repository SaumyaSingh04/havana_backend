import express from "express";
import upload from "../middleware/upload.js";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateStatus,
} from "../controllers/booking.js";

const router = express.Router();

// Upload photo & idProof
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  createBooking
);

router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
router.patch("/:id/status", updateStatus);

export default router;
