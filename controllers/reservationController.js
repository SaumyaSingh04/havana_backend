import { Reservation } from '../models/reservation.js';
import { Room } from '../models/room.js';
import { upsertGuestOnBooking } from "./guestController.js";

// ➕ Generate 4-digit code
const generate4DigitCode = () => Math.floor(1000 + Math.random() * 9000);

// 🧠 Generate unique GRC number (GRC-3245)
const generateGRC = async () => {
  let grcNo;
  let exists = true;
  while (exists) {
    grcNo = `GRC-${generate4DigitCode()}`;
    exists = await Reservation.findOne({ grcNo });
  }
  return grcNo;
};

// 🧠 Generate bookingRefNo (BRF-YYYYMMDD-HHMM-1234)
const generateBookingRef = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
  return `BRF-${datePart}-${timePart}-${generate4DigitCode()}`;
};

// 🧠 Generate reservationId (RSV-YYYYMMDD-HHMM-1234)
const generateReservationId = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
  return `RSV-${datePart}-${timePart}-${generate4DigitCode()}`;
};



// 🔹 Create a new reservation
export const createReservation = async (req, res) => {
  try {
    // 🎯 Generate IDs upfront
    const reservationId = generateReservationId();
    const bookingRefNo = generateBookingRef();
    const grcNo = await generateGRC();

    // 👉 Create reservation instance
    const reservation = new Reservation({
      reservationId,
      bookingRefNo,
      grcNo,
      ...req.body,
    });

    // 📍 Mark room status reserved
    if (reservation.roomAssigned) {
      const updatedRoom = await Room.findByIdAndUpdate(
        reservation.roomAssigned,
        { status: 'reserved', is_reserved: true },
        { new: true }
      );
      console.log('Room updated:', updatedRoom);
    }
    

    await reservation.save();
    await upsertGuestOnBooking(booking);

    res.status(201).json({
      success: true,
      message: "Reservation created",
      reservation,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// 🔹 Get all reservations
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('category')
      .populate('roomAssigned')
      .sort({ createdAt: -1 });

    const safeReservations = reservations.map(reservation => {
      const resObj = reservation.toObject();
      if (!resObj.category) {
        resObj.category = { name: 'Unknown' };
      }
      return resObj;
    });

    res.json({ success: true, reservations: safeReservations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔹 Get reservation by ID
export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('category')
      .populate('roomAssigned');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const safeReservation = reservation.toObject();
    if (!safeReservation.category) {
      safeReservation.category = { name: 'Unknown' };
    }

    res.json({ success: true, reservation: safeReservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔹 Get reservation by GRC number
export const getReservationByGRC = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ grcNo: req.params.grcNo })
      .populate('category')
      .populate('roomAssigned');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const safeReservation = reservation.toObject();
    if (!safeReservation.category) {
      safeReservation.category = { name: 'Unknown' };
    }

    res.json({ success: true, reservation: safeReservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔹 Update reservation
export const updateReservation = async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, reservation: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// cancle revervation
export const cancelReservation = async (req, res) => {
  try {
    const { cancellationReason, cancelledBy } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "Cancelled",
          cancellationReason,
          cancelledBy,
          cancelledAt: new Date()
        }
      },
      { new: true, runValidators: false } // <-- disable full validation
    );

    if (!reservation) {
      return res.status(404).json({ success: false, error: "Reservation not found" });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    console.error("Cancel Reservation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔹 Mark as No-Show
export const markNoShow = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled', isNoShow: true },
      { new: true }
    );
    res.json({ success: true, message: 'Marked as No-Show', reservation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔹 Delete reservation (hard delete)
export const deleteReservation = async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, message: 'Reservation deleted permanently' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔹 Link Reservation to Check-In
export const linkToCheckIn = async (req, res) => {
  try {
    const { checkInId } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.linkedCheckInId = checkInId;
    reservation.status = 'Confirmed'; // Optional
    reservation.b_timestamp = Math.floor(Date.now() / 1000);
    reservation.bookingDate = new Date();

    await reservation.save();

    res.json({ success: true, message: 'Reservation linked to Booking', reservation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

