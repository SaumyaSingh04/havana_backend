// routes/bookingRoutes.js (ESM version)
import express from "express";
import {
  bookRoom,
  getBookings,
  getBookingsByCategory,
  getBookingByGRC,
  getBookingById,
  deleteBooking,
  permanentlyDeleteBooking,
  updateBooking,
  extendBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// ✅ Book a room (admin or staff from 'reception')
router.post("/book", bookRoom);

// ✅ Get all bookings (admin or staff from 'reception')
router.get("/all", getBookings);

// ✅ Get bookings by category (admin or staff from 'reception')
router.get("/category/:categoryId", getBookingsByCategory);

// ✅ Get booking by GRC number
router.get("/grc/:grcNo", getBookingByGRC);

// ✅ Get booking by ID (admin or staff from 'reception')
router.get("/:bookingId", getBookingById);

// ✅ Unbook (soft delete) (admin or staff from 'reception')
router.delete("/delete/:bookingId", deleteBooking);

// ✅ Permanently delete (admin only)
router.delete(
  "/permanent-delete/:bookingId",
  permanentlyDeleteBooking
);

// ✅ Update booking (admin or staff from 'reception')
router.put("/update/:bookingId", updateBooking);

// ✅ Extend booking (admin or staff from 'reception')
router.post("/extend/:bookingId", extendBooking);

export default router;
