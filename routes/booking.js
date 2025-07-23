import express from "express";
import {
  bookRoom,
  getBookings,                      // paginated + search + filters
  getBookingInfo,                   // get by id / grc / category mixed
  getGuestPrefillInfo,             // uses reservationId or grcNo
  getGuestInfoByBookingRefAndGRC,  // secure validation (ref + grc match)
  updateBooking,
  extendBooking,
  checkoutBooking,
  deleteBooking,
  permanentlyDeleteBooking
} from "../controllers/bookingController.js";

const router = express.Router();

// ---------- BOOKING CRUD ----------
router.post("/book", bookRoom);
router.get("/", getBookings);                          // 📘 GET /api/bookings?search=...&page=1...
router.get("/info", getBookingInfo);                   // 🔍 GET by bookingId, grcNo, or categoryId
router.get("/guest-info/prefill", getGuestPrefillInfo); // ✅ GET reservationId OR grc ⇒ autofill data
router.get("/guest-info/validate", getGuestInfoByBookingRefAndGRC); // Auth check
router.put("/update/:bookingId", updateBooking);
router.post("/extend/:bookingId", extendBooking);
router.post("/checkout/:bookingId", checkoutBooking);

// ---------- DELETE ----------
router.delete("/delete/:bookingId", deleteBooking);               // Soft delete
router.delete("/permanent-delete/:bookingId", permanentlyDeleteBooking); // Hard delete

export default router;
