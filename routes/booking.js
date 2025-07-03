import express from "express";
import upload from "../middleware/upload.js";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateStatus,
  searchBookings,
  exportBookingsExcel,
} from "../controllers/booking.js";

const router = express.Router();

// Create new booking with image uploads
router.post(
  "/",
  upload.fields([
    { name: "photoUrl", maxCount: 1 },
    { name: "idProofImageUrl", maxCount: 1 },
    { name: "idProofImageUrl2", maxCount: 1 },
    { name: "cameraPhotoUrl", maxCount: 1 },
  ]),
  createBooking
);

// Export bookings as CSV
router.get("/exportBookingsExcel", exportBookingsExcel);

// Search bookings
router.get("/search", searchBookings);

// Get all bookings
router.get("/", getAllBookings);

// Get booking by ID
router.get("/:id", getBookingById);

// ✅ Update booking with image fields
router.put(
  "/:id",
  upload.fields([
    { name: "photoUrl", maxCount: 1 },
    { name: "idProofImageUrl", maxCount: 1 },
    { name: "idProofImageUrl2", maxCount: 1 },
    { name: "cameraPhotoUrl", maxCount: 1 },
  ]),
  updateBooking
);

// Delete booking
router.delete("/:id", deleteBooking);

// Update booking status
router.patch("/:id/status", updateStatus);

export default router;
