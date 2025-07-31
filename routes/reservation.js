// routes/reservationRoutes.js (ESM version)
import express from "express";
import {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationByGRC,
  updateReservation,
  cancelReservation,
  markNoShow,
  linkToCheckIn,
  deleteReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

// ✅ Reservation APIs : /api/reservation
router.post("/", createReservation);
router.get("/", getAllReservations);
router.get("/:id", getReservationById);
router.get("/grc/:grcNo", getReservationByGRC);
router.put("/:id", updateReservation);
router.patch("/:id/cancel", cancelReservation);
router.patch("/:id/no-show", markNoShow);
router.patch("/:id/link-booking", linkToCheckIn);
router.delete("/:id", deleteReservation);

export default router;
