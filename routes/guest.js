import express from 'express';
import {
  upsertGuest,
  getGuestByGRC,
  addGuestVisit,
  getAllGuests
} from '../controllers/guestController.js';

const router = express.Router();

// ✅ Create or update guest using grcNo + bookingId
router.post("/upsert", upsertGuest);

// ✅ Get guest by GRC no
router.get("/:grcNo", getGuestByGRC);

// ✅ Add visit by bookingId + grcNo (update visitStats)
router.post("/add-visit", addGuestVisit);

// ✅ Get all guests (filtered or full)
router.get("/", getAllGuests);

export default router;
