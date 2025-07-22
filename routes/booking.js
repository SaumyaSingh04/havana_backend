import express from "express";
import {
  bookRoom,
  getBookings,
  getBookingsByCategory,
  getBookingByGRC,
  getGuestInfoByGRC,
  getGuestInfoByBookingIdAndGRC,
  getBookingById,
  updateBooking,
  extendBooking,
  checkoutBooking,
  deleteBooking,
  permanentlyDeleteBooking
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/book", bookRoom);
router.get("/all", getBookings);
router.get("/category/:categoryId", getBookingsByCategory);
router.get("/grc/:grcNo", getBookingByGRC);
router.get("/guest-info/grc/:grcNo", getGuestInfoByGRC); // 🔄 Autofill form
router.get("/guest-info/validate", getGuestInfoByBookingIdAndGRC); 
router.get("/:bookingId", getBookingById);
router.put("/update/:bookingId", updateBooking);
router.post("/extend/:bookingId", extendBooking);
// ✅ Checkout 
router.post("/checkout/:bookingId", checkoutBooking);
router.delete("/delete/:bookingId", deleteBooking);
router.delete("/permanent-delete/:bookingId", permanentlyDeleteBooking);

export default router;
